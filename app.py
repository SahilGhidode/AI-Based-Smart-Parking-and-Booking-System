# app.py
import streamlit as st
import cv2
import numpy as np
import time
import json
from datetime import datetime, timedelta
from shapely.geometry import Point, Polygon
from PIL import Image
import io
import random

st.set_page_config(layout="centered", page_title="SmartPark AI - Prototype", page_icon="🚗")

# ---------------------------
# ---------- CONFIG ----------
# ---------------------------
# normalized slot coordinates (x,y in [0..1]) relative to image width/height
DEFAULT_SLOTS = [
    {"id": 1, "name": "S1", "coords": [(0.05,0.10),(0.29,0.10),(0.29,0.32),(0.05,0.32)]},
    {"id": 2, "name": "S2", "coords": [(0.33,0.10),(0.57,0.10),(0.57,0.32),(0.33,0.32)]},
    {"id": 3, "name": "S3", "coords": [(0.61,0.10),(0.85,0.10),(0.85,0.32),(0.61,0.32)]},
    {"id": 4, "name": "S4", "coords": [(0.05,0.38),(0.29,0.38),(0.29,0.60),(0.05,0.60)]},
    {"id": 5, "name": "S5", "coords": [(0.33,0.38),(0.57,0.38),(0.57,0.60),(0.33,0.60)]},
    {"id": 6, "name": "S6", "coords": [(0.61,0.38),(0.85,0.38),(0.85,0.60),(0.61,0.60)]},
]

# mock sample image (if you want to test) - you can replace with your own
SAMPLE_IMAGE_URL = "https://i.imgur.com/9Q7Y3tA.png"

# ---------------------------
# ----- Helper functions -----
# ---------------------------

def ensure_session_state():
    if "slots" not in st.session_state:
        st.session_state["slots"] = DEFAULT_SLOTS.copy()
    if "bookings" not in st.session_state:
        # bookings: list of dicts {id, slot_id, user, start_ts, end_ts, status}
        st.session_state["bookings"] = []
    if "logs" not in st.session_state:
        st.session_state["logs"] = []   # simple event logs
    if "frame_idx" not in st.session_state:
        st.session_state["frame_idx"] = 0
    if "video_path" not in st.session_state:
        st.session_state["video_path"] = None
    if "bg_subtractor" not in st.session_state:
        st.session_state["bg_subtractor"] = cv2.createBackgroundSubtractorMOG2(history=200, varThreshold=40, detectShadows=False)
    if "detection_method" not in st.session_state:
        st.session_state["detection_method"] = "motion"  # or "yolo" if you later enable YOLO

ensure_session_state()

def normalized_to_pixels(coords_norm, frame_shape):
    """
    coords_norm: list of (x_frac,y_frac) pairs
    frame_shape: frame.shape (H,W,...)
    returns list of (x,y) pixel coords
    """
    h, w = frame_shape[:2]
    return [(int(x*w), int(y*h)) for (x,y) in coords_norm]

def load_image_from_upload(uploaded_file):
    data = uploaded_file.read()
    img = Image.open(io.BytesIO(data)).convert("RGB")
    frame = np.array(img)[:, :, ::-1]  # RGB->BGR for OpenCV
    return frame

def get_frame_from_video(video_path, idx):
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    ret, frame = cap.read()
    cap.release()
    if not ret:
        return None
    return frame

# Basic "vehicle detection" fallback using background subtraction + contours
def detect_vehicles_motion(frame, min_area=900):
    fgmask = st.session_state["bg_subtractor"].apply(frame)
    # morphological ops to clean
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5,5))
    fgmask = cv2.morphologyEx(fgmask, cv2.MORPH_OPEN, kernel, iterations=1)
    contours, _ = cv2.findContours(fgmask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bboxes = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > min_area:
            x,y,w,h = cv2.boundingRect(cnt)
            bboxes.append((x,y,x+w,y+h))
    return bboxes

# NOTE: YOLO integration (ultralytics) - optional
def detect_vehicles_yolo(frame):
    # This function will attempt to use ultralytics YOLO if installed.
    try:
        from ultralytics import YOLO
    except Exception as e:
        st.warning("YOLO not installed. Install 'ultralytics' to use YOLO. Using motion detection fallback.")
        return detect_vehicles_motion(frame)
    if "yolo_model" not in st.session_state:
        # small model; you can download or use 'yolov8n.pt'
        st.session_state["yolo_model"] = YOLO("yolov8n.pt")
    results = st.session_state["yolo_model"].predict(frame, imgsz=640, conf=0.35, verbose=False)
    # Collect boxes for vehicle-related classes (COCO classes: car, truck, bus, motorcycle)
    vehicle_boxes = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls = int(box.cls[0])
            # COCO vehicle classes ids: 2=car, 3=motorbike, 5=bus, 7=truck (note: check your model)
            if cls in [2,3,5,7]:
                x1,y1,x2,y2 = map(int, box.xyxy[0].tolist())
                vehicle_boxes.append((x1,y1,x2,y2))
    return vehicle_boxes

def detect_vehicles(frame):
    method = st.session_state["detection_method"]
    if method == "yolo":
        return detect_vehicles_yolo(frame)
    else:
        return detect_vehicles_motion(frame)

def slot_states_from_detections(frame, slots_norm, detections):
    """
    return dict slot_id -> {'state': 'occupied'|'reserved'|'available', 'reason':...}
    Priority:
      - If detection centroid inside slot polygon -> occupied
      - elif active booking for that slot (current time between start and end) -> reserved
      - else available
    """
    h,w = frame.shape[:2]
    slot_states = {}
    # build polygons in pixel coords
    polygons = {}
    for s in slots_norm:
        pix = normalized_to_pixels(s["coords"], frame.shape)
        polygons[s["id"]] = Polygon(pix)

    # prepare detection centroids
    centroids = []
    for (x1,y1,x2,y2) in detections:
        cx = (x1+x2)/2
        cy = (y1+y2)/2
        centroids.append((cx,cy,(x1,y1,x2,y2)))

    now = datetime.utcnow()
    # check bookings
    bookings = st.session_state["bookings"]
    active_booking_slots = set()
    for b in bookings:
        if b["status"] == "confirmed":
            if b["start_ts"] <= now <= b["end_ts"]:
                active_booking_slots.add(b["slot_id"])

    for s in slots_norm:
        sid = s["id"]
        poly = polygons[sid]
        occupied = False
        for (cx,cy,bbox) in centroids:
            pt = Point(cx,cy)
            if poly.contains(pt):
                occupied = True
                break
        if occupied:
            slot_states[sid] = {"state":"occupied", "reason":"detected"}
        elif sid in active_booking_slots:
            slot_states[sid] = {"state":"reserved", "reason":"booked"}
        else:
            slot_states[sid] = {"state":"available", "reason":"free"}
    return slot_states


def draw_annotations(frame, slots_norm, detections, slot_states):
    out = frame.copy()
    # draw detections
    for (x1,y1,x2,y2) in detections:
        cv2.rectangle(out, (x1,y1), (x2,y2), (0,128,255), 2)  # bbox
    # draw slots
    for s in slots_norm:
        sid = s["id"]
        pix = normalized_to_pixels(s["coords"], out.shape)
        pts = np.array(pix, np.int32).reshape((-1,1,2))
        state = slot_states.get(sid, {"state":"available"})["state"]
        color = (34,197,94)  # green default
        if state == "occupied": color = (255,50,50)   # red
        elif state == "reserved": color = (240,219,79) # yellow
        cv2.polylines(out, [pts], True, color, 2)
        # fill small transparent overlay
        overlay = out.copy()
        cv2.fillPoly(overlay, [pts], color)
        alpha = 0.15
        cv2.addWeighted(overlay, alpha, out, 1 - alpha, 0, out)
        # label
        x0,y0 = pix[0]
        cv2.putText(out, f"{s['name']} ({state[0]})", (x0+4,y0+16), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,0), 2, cv2.LINE_AA)
    # convert BGR to RGB for display by PIL/streamlit
    out_rgb = cv2.cvtColor(out, cv2.COLOR_BGR2RGB)
    return out_rgb

# ---------------------------
# ----- Booking utilities ----
# ---------------------------

def create_booking(slot_id, user="demo_user", minutes_from_now=10):
    now = datetime.utcnow()
    start = now
    end = now + timedelta(minutes=minutes_from_now)
    bid = len(st.session_state["bookings"]) + 1
    booking = {"id": bid, "slot_id": slot_id, "user": user, "start_ts": start, "end_ts": end, "status": "confirmed"}
    st.session_state["bookings"].append(booking)
    st.session_state["logs"].append(f"{datetime.utcnow().isoformat()} - Booking created id={bid} slot={slot_id}")
    return booking

def check_bookings_auto_actions(slot_states, grace_seconds=60):
    """
    This is run each time the frame updates — checks for no-shows and overstays.
    - No-show: booking started, but slot not occupied for more than grace -> auto-cancel
    - Overstay: booking ended, but slot still occupied -> mark overstay
    """
    now = datetime.utcnow()
    alerts = []
    for b in st.session_state["bookings"]:
        if b["status"] != "confirmed":
            continue
        sid = b["slot_id"]
        # no-show: started but empty
        if b["start_ts"] <= now <= b["end_ts"]:
            # booking active window
            st_state = slot_states.get(sid, {"state":"available"})["state"]
            if st_state != "occupied":
                # how long since start?
                since_start = (now - b["start_ts"]).total_seconds()
                if since_start > grace_seconds:
                    b["status"] = "auto_cancelled"
                    alerts.append(f"Booking {b['id']} auto-cancelled (no-show)")
                    st.session_state["logs"].append(f"{datetime.utcnow().isoformat()} - Booking auto-cancelled id={b['id']} slot={sid}")
        # overstay: ended but slot still occupied
        if now > b["end_ts"] and b["status"] == "confirmed":
            st_state = slot_states.get(sid, {"state":"available"})["state"]
            if st_state == "occupied":
                b["status"] = "overstay"
                alerts.append(f"Booking {b['id']} overstay detected for slot {sid}")
                st.session_state["logs"].append(f"{datetime.utcnow().isoformat()} - Overstay id={b['id']} slot={sid}")
    return alerts

# ---------------------------
# --------- UI pages ---------
# ---------------------------

st.title("🚗 SmartPark AI — Streamlit Prototype")
st.markdown("*Machine Learning & Computer Vision based Smart Parking (Prototype)*")

menu = st.sidebar.selectbox("Navigation", ["Home", "Image Detection", "Video Detection (Step)", "Bookings", "Admin"])

# ---------- Home ----------
if menu == "Home":
    col1, col2 = st.columns([2,1])
    with col1:
        st.header("How to demo")
        st.write("""
        1. Go to Image Detection to try on an image.  
        2. Go to Video Detection to step through video frames (demo real-time concept).  
        3. Use Bookings to create demo bookings (Immediate for N minutes).  
        4. The system will auto-cancel no-shows after a grace period and detect overstays.
        """)
        st.markdown("*Notes / Integration*: Later replace motion detection with YOLO/Ultralytics for production. ML prediction model can be plugged in to the Admin panel.")
        st.markdown("---")
        st.subheader("Default sample")
        st.image(SAMPLE_IMAGE_URL, caption="Sample parking image (demo)")
    with col2:
        st.subheader("Quick Actions")
        if st.button("Create sample booking (slot 2, 3 minutes)"):
            b = create_booking(2, user="demo", minutes_from_now=3)
            st.success(f"Created booking id {b['id']} slot {b['slot_id']}")
        st.write("## Logs")
        logs_small = st.session_state["logs"][-8:][::-1]
        for l in logs_small:
            st.text(l)

# ---------- Image Detection ----------
elif menu == "Image Detection":
    st.header("Image Detection (Single Image)")
    uploaded = st.file_uploader("Upload parking image (png/jpg)", type=["png","jpg","jpeg"])
    col1, col2 = st.columns(2)
    if uploaded is None:
        st.info("Or use sample image")
        if st.button("Use sample image"):
            import requests
            r = requests.get(SAMPLE_IMAGE_URL)
            img = Image.open(io.BytesIO(r.content)).convert("RGB")
            frame = np.array(img)[:, :, ::-1]
        else:
            frame = None
    else:
        frame = load_image_from_upload(uploaded)

    if frame is not None:
        st.session_state["frame_idx"] = 0
        st.session_state["video_path"] = None
        # detection
        detections = detect_vehicles(frame)
        slot_states = slot_states_from_detections(frame, st.session_state["slots"], detections)
        annotated = draw_annotations(frame, st.session_state["slots"], detections, slot_states)
        st.image(annotated, caption="Annotated frame", use_column_width=True)
        # show slot table
        st.subheader("Slot States")
        for s in st.session_state["slots"]:
            sid = s["id"]
            st.write(f"{s['name']}** — {slot_states[sid]['state']} ({slot_states[sid]['reason']})")
        # allow booking demo
        st.markdown("---")
        st.subheader("Quick booking (demo)")
        slot_choice = st.selectbox("Choose slot to book", [s["id"] for s in st.session_state["slots"]])
        minutes = st.number_input("Duration (minutes)", min_value=1, max_value=1440, value=30)
        if st.button("Book Now (immediate)"):
            b = create_booking(slot_choice, user="demo", minutes_from_now=minutes)
            st.success(f"Booking created id {b['id']} for slot {b['slot_id']} (auto-cancel if no-show)")

# ---------- Video Detection (Step mode) ----------
elif menu == "Video Detection (Step)":
    st.header("Video Detection (Step through frames)")
    st.markdown("Upload an .mp4 demo or use sample video file path. Use *Next frame* to step. For small auto-play, use Play 10 frames.")
    uploaded_video = st.file_uploader("Upload mp4 video (optional)", type=["mp4"])
    if uploaded_video:
        # save to temp file and set session_state
        tmp_path = f"temp_video_{random.randint(1000,9999)}.mp4"
        with open(tmp_path, "wb") as f:
            f.write(uploaded_video.read())
        st.session_state["video_path"] = tmp_path
        st.session_state["frame_idx"] = 0

    video_path = st.session_state.get("video_path", None)
    if video_path is None:
        st.info("No video uploaded. You can demo with an image via Image Detection, or upload a short mp4.")
    else:
        cols = st.columns([1,1,1,1])
        if cols[0].button("<< Reset to 0"):
            st.session_state["frame_idx"] = 0
        if cols[1].button("Next frame"):
            st.session_state["frame_idx"] += 1
        if cols[2].button("Play 10 frames"):
            st.session_state["auto_play"] = True
            # we'll handle below
        if cols[3].button("Stop autoplay"):
            st.session_state["auto_play"] = False

        # autoplay loop for 10 frames max (non-blocking-ish)
        if st.session_state.get("auto_play", False):
            for _ in range(10):
                st.session_state["frame_idx"] += 1
                # small sleep so UI can update per rerun
                time.sleep(0.05)

        # get frame
        idx = st.session_state["frame_idx"]
        frame = get_frame_from_video(video_path, idx)
        if frame is None:
            st.warning("Reached end of video or cannot read frame")
        else:
            detections = detect_vehicles(frame)
            slot_states = slot_states_from_detections(frame, st.session_state["slots"], detections)
            # run auto-actions (no-show/overstay checks)
            alerts = check_bookings_auto_actions(slot_states, grace_seconds=30)
            if alerts:
                for a in alerts:
                    st.warning(a)
            annotated = draw_annotations(frame, st.session_state["slots"], detections, slot_states)
            st.image(annotated, caption=f"Frame {idx}", use_column_width=True)
            # small state display
            st.subheader("Slot states")
            cols2 = st.columns(3)
            for s in st.session_state["slots"]:
                sid = s["id"]
                cols2[(sid-1)%3].write(f"{s['name']}** - {slot_states[sid]['state']}")

# ---------- Bookings ----------
elif menu == "Bookings":
    st.header("Bookings (Demo)")
    st.write("Create an immediate booking for X minutes (demo).")
    slot_choice = st.selectbox("Select slot", [s["id"] for s in st.session_state["slots"]])
    minutes = st.number_input("Book for minutes", min_value=1, max_value=1440, value=30)
    if st.button("Create Booking Now"):
        b = create_booking(slot_choice, user="demo", minutes_from_now=minutes)
        st.success(f"Created booking id {b['id']}. Expires at {b['end_ts'].strftime('%Y-%m-%d %H:%M:%S')} UTC")
    st.markdown("---")
    st.subheader("Active bookings")
    now = datetime.utcnow()
    for b in st.session_state["bookings"]:
        st.write(f"#{b['id']} | Slot {b['slot_id']} | {b['status']} | {b['start_ts'].strftime('%H:%M')} → {b['end_ts'].strftime('%H:%M')}")
    if st.button("Clear all bookings (demo)"):
        st.session_state["bookings"] = []
        st.success("All demo bookings cleared")

# ---------- Admin ----------
elif menu == "Admin":
    st.header("Admin / Reports (Demo)")
    # compute current occupancy from last-known frame if available
    # use last frame stored via frame_idx/video
    video_path = st.session_state.get("video_path", None)
    frame = None
    if video_path:
        frame = get_frame_from_video(video_path, st.session_state.get("frame_idx", 0))
    # fallback to sample image
    if frame is None:
        import requests
        r = requests.get(SAMPLE_IMAGE_URL)
        img = Image.open(io.BytesIO(r.content)).convert("RGB")
        frame = np.array(img)[:, :, ::-1]
    detections = detect_vehicles(frame)
    slot_states = slot_states_from_detections(frame, st.session_state["slots"], detections)
    annotated = draw_annotations(frame, st.session_state["slots"], detections, slot_states)
    st.image(annotated, caption="Latest view (Admin)", use_column_width=True)
    # report metrics
    tot = len(st.session_state["slots"])
    occ = len([1 for s in slot_states.values() if s["state"]=="occupied"])
    res = len([1 for s in slot_states.values() if s["state"]=="reserved"])
    avl = tot - occ - res
    st.metric("Total slots", tot)
    st.metric("Occupied", occ)
    st.metric("Reserved", res)
    st.metric("Available", avl)
    st.markdown("---")
    st.subheader("Bookings Log")
    for b in st.session_state["bookings"]:
        st.write(f"#{b['id']} | Slot {b['slot_id']} | {b['status']} | {b['start_ts'].strftime('%H:%M')} → {b['end_ts'].strftime('%H:%M')}")
    st.markdown("---")
    st.subheader("Event logs (recent)")
    for l in st.session_state["logs"][-20:][::-1]:
        st.write(l)

# ---------------------------
# ---------- END ------------
# ---------------------------
