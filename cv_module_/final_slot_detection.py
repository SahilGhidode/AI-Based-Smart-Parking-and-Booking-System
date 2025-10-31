import numpy as np
import cv2
from ultralytics import YOLO

# -------------------------------
# Load video
# -------------------------------
video_path = r"C:\Users\RICHA MISHRA\ParkVision\SmartParking\cv_module_\parking1.mp4"
camera = cv2.VideoCapture(video_path)

if not camera.isOpened():
    print("[ERROR] Could not open video file.")
    exit()

# -------------------------------
# Load pretrained YOLO model (for car detection)
# -------------------------------
# COCO model: class 2 = car, 3 = motorcycle, 5 = bus, 7 = truck
model = YOLO("yolov8n.pt")

# -------------------------------
# Load parking slot coordinates
# -------------------------------
print("[INFO] Loading parking coordinates...")
with open("slot_coordinates.txt") as f:
    lines = [line.strip() for line in f.readlines() if line.strip()]

total_slots = len(lines)
parking_lot_coords = []

for line in lines:
    coords = list(map(int, line.split()))
    points = np.array([
        (coords[0], coords[1]),
        (coords[2], coords[3]),
        (coords[4], coords[5]),
        (coords[6], coords[7])
    ])
    parking_lot_coords.append(points)

print(f"[INFO] Loaded {total_slots} parking slots.")

# -------------------------------
# Setup video writer
# -------------------------------
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter("output_parking_slots.mp4", fourcc, 20.0, (1300, 650))

# -------------------------------
# Process each frame
# -------------------------------
while True:
    ret, frame = camera.read()
    if not ret:
        print("[INFO] End of video or failed to read frame.")
        break

    frame = cv2.resize(frame, (1300, 650))

    # Run YOLO prediction
    results = model.predict(source=frame, conf=0.4, verbose=False)
    detections = results[0].boxes

    # Get all detected car centers
    car_centers = []
    for box in detections:
        cls = int(box.cls[0])
        if cls in [2, 3, 5, 7]:  # car, motorcycle, bus, truck
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            car_centers.append((cx, cy))
            # draw small point for car center
            cv2.circle(frame, (cx, cy), 4, (255, 255, 255), -1)

    # Determine occupied/free slots
    available_slots = 0
    for idx, poly in enumerate(parking_lot_coords, start=1):
        occupied = False
        for center in car_centers:
            if cv2.pointPolygonTest(poly, center, False) >= 0:
                occupied = True
                break

        color = (0, 0, 255) if occupied else (0, 255, 0)  # red if occupied, green if free
        if not occupied:
            available_slots += 1

        cv2.polylines(frame, [poly], True, color, 2)
        cv2.putText(frame, f"Slot {idx}", (poly[0][0], poly[0][1] - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

    # Add counter overlay
    cv2.putText(frame, f"Available Slots: {available_slots}/{total_slots}",
                (40, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    # Display output frame
    try:
        cv2.imshow("Parking Slot Detection", frame)
    except:
        cv2.imwrite("output_frame.jpg", frame)
        print("[WARNING] GUI not supported. Saved output_frame.jpg instead.")
        break

    out.write(frame)

    key = cv2.waitKey(1)
    if key % 256 == 27:  # ESC key to quit
        print("[INFO] Exiting program.")
        break

camera.release()
out.release()
cv2.destroyAllWindows()
