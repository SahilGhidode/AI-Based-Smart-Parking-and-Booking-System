from ultralytics import YOLO
import cv2

# -------------------------------
# Load pretrained YOLO model (COCO)
# -------------------------------
# This model detects 80 classes including cars, trucks, bikes, etc.
model = YOLO("yolov8n.pt")  # you can also try yolov8s.pt for better accuracy

# -------------------------------
# Path to your video file
# -------------------------------
video_path = r"C:\Users\RICHA MISHRA\ParkVision\SmartParking\cv_module_\parking1.mp4"

# Open video
cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print("[ERROR] Could not open video file.")
    exit()

print("[INFO] Starting car detection... Press ESC to quit.")

# -------------------------------
# Loop through frames
# -------------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        print("[INFO] End of video or cannot read frame.")
        break

    # Resize frame for consistent view (optional)
    frame = cv2.resize(frame, (1280, 720))

    # Run YOLO prediction on the frame
    results = model.predict(source=frame, conf=0.4, verbose=False)

    # Extract detections
    result = results[0]
    boxes = result.boxes
    names = model.names  # class names from COCO

    for box in boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        x1, y1, x2, y2 = map(int, box.xyxy[0])

        # Only show vehicles (car=2, truck=7, bus=5, motorcycle=3)
        if cls in [2, 3, 5, 7]:
            label = f"{names[cls]} {conf:.2f}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    # -------------------------------
    # Display output frame
    # -------------------------------
    try:
        cv2.imshow("YOLO Car Detection", frame)
    except:
        # If running in environment without GUI (like VSCode terminal)
        cv2.imwrite("output_frame.jpg", frame)
        print("[WARNING] GUI not supported. Saved frame as output_frame.jpg.")
        break

    key = cv2.waitKey(1)
    if key % 256 == 27:  # ESC key to quit
        print("[INFO] Stopped by user.")
        break

cap.release()
cv2.destroyAllWindows()

