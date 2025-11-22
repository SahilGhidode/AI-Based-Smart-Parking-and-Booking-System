import argparse
import os
import sys
import numpy as np
try:
    import cv2
except Exception as e:
    print(f"[ERROR] OpenCV (cv2) is not available: {e}")
    print("Install it in the venv: pip install opencv-python")
    sys.exit(1)

try:
    from ultralytics import YOLO
except Exception as e:
    print(f"[ERROR] ultralytics package is not available: {e}")
    print("Install it in the venv: pip install ultralytics")
    sys.exit(1)


def load_slot_polygons(coords_path):
    if not os.path.exists(coords_path):
        raise FileNotFoundError(f"Slot coordinates file not found: {coords_path}")
    with open(coords_path, 'r') as f:
        lines = [ln.strip() for ln in f.readlines() if ln.strip()]
    polys = []
    for line in lines:
        parts = line.split()
        if len(parts) < 8:
            continue
        coords = list(map(int, parts[:8]))
        poly = np.array([
            (coords[0], coords[1]),
            (coords[2], coords[3]),
            (coords[4], coords[5]),
            (coords[6], coords[7])
        ], dtype=np.int32)
        polys.append(poly)
    return polys


def run_detection(video_path, coords_path, model_path, output_path, conf, resize_w, resize_h, display, max_frames=0):
    if not os.path.exists(video_path):
        print(f"[ERROR] Video file not found: {video_path}")
        return

    print("[INFO] Loading model...")
    model = YOLO(model_path)

    print("[INFO] Loading slot coordinates...")
    parking_lot_coords = load_slot_polygons(coords_path)
    total_slots = len(parking_lot_coords)
    print(f"[INFO] Loaded {total_slots} parking slots.")

    # allow webcam index like '0' or integer 0
    try:
        cam_idx = int(video_path)
        cap = cv2.VideoCapture(cam_idx)
    except Exception:
        cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("[ERROR] Could not open video file.")
        return

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = None
    if output_path:
        out = cv2.VideoWriter(output_path, fourcc, max(10.0, cap.get(cv2.CAP_PROP_FPS) or 20.0), (resize_w, resize_h))

    frame_idx = 0
    occupancy_counts = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[INFO] End of video or failed to read frame.")
                break

            frame = cv2.resize(frame, (resize_w, resize_h))

            results = model.predict(source=frame, conf=conf, verbose=False)
            detections = results[0].boxes

            car_centers = []
            for box in detections:
                cls = int(box.cls[0])
                if cls in [2, 3, 5, 7]:  # car, motorcycle, bus, truck
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                    car_centers.append((cx, cy))
                    cv2.circle(frame, (cx, cy), 4, (255, 255, 255), -1)

            available_slots = 0
            for idx, poly in enumerate(parking_lot_coords, start=1):
                occupied = False
                for center in car_centers:
                    if cv2.pointPolygonTest(poly, center, False) >= 0:
                        occupied = True
                        break

                color = (0, 0, 255) if occupied else (0, 255, 0)
                if not occupied:
                    available_slots += 1

                cv2.polylines(frame, [poly], True, color, 2)
                # draw label near first vertex (clamp to image)
                x_label = max(0, min(frame.shape[1] - 1, poly[0][0]))
                y_label = max(0, min(frame.shape[0] - 1, poly[0][1] - 5))
                cv2.putText(frame, f"Slot {idx}", (x_label, y_label), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

            occupancy_counts.append(total_slots - available_slots)
            cv2.putText(frame, f"Available Slots: {available_slots}/{total_slots}", (40, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

            if display:
                try:
                    cv2.namedWindow("Parking Slot Detection", cv2.WINDOW_NORMAL)
                    cv2.imshow("Parking Slot Detection", frame)
                except Exception:
                    # headless environment
                    display = False

            if out is not None:
                out.write(frame)

            key = cv2.waitKey(1) if display else -1
            if key % 256 == 27:
                print("[INFO] Exiting program by user.")
                break

            frame_idx += 1
            if max_frames and frame_idx >= max_frames:
                print(f"[INFO] Reached max_frames={max_frames}, stopping.")
                break

    finally:
        cap.release()
        if out is not None:
            out.release()
        cv2.destroyAllWindows()

    # summary
    if occupancy_counts:
        avg_occ = sum(occupancy_counts) / len(occupancy_counts)
        print(f"[SUMMARY] Processed {frame_idx} frames. Average occupied slots per frame: {avg_occ:.2f} / {total_slots}")
    else:
        print("[SUMMARY] No frames were processed.")


def parse_args():
    p = argparse.ArgumentParser(description="Final parking slot detection test script")
    p.add_argument("--video", default="parking1.mp4", help="Path to input video")
    p.add_argument("--coords", default="slot_coordinates.txt", help="Path to slot coordinates file")
    p.add_argument("--model", default="yolov8n.pt", help="Path to YOLO model file")
    p.add_argument("--output", default="output_parking_slots.mp4", help="Path to output video (optional)")
    p.add_argument("--conf", type=float, default=0.4, help="Detection confidence threshold")
    p.add_argument("--width", type=int, default=1300, help="Resize width for processing")
    p.add_argument("--height", type=int, default=650, help="Resize height for processing")
    p.add_argument("--max-frames", type=int, default=0, help="Stop after processing this many frames (0 = all)")
    p.add_argument("--no-display", dest="display", action="store_false", help="Run without GUI display")
    p.set_defaults(display=True)
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_detection(args.video, args.coords, args.model, args.output, args.conf, args.width, args.height, args.display, args.max_frames)
