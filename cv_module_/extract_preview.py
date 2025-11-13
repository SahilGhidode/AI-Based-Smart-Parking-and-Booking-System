import cv2
import os

in_path = os.path.join(os.path.dirname(__file__), 'output_parking_slots.mp4')
out_path = os.path.join(os.path.dirname(__file__), 'preview_frame.jpg')

if not os.path.exists(in_path):
    print('MISSING')
    raise SystemExit(1)

cap = cv2.VideoCapture(in_path)
ret, frame = cap.read()
if not ret:
    print('NO FRAME')
    cap.release()
    raise SystemExit(1)

cv2.imwrite(out_path, frame)
cap.release()
print('WROTE', out_path)
