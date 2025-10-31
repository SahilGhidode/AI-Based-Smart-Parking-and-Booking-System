import cv2
import numpy as np

print("[INFO] Loading parking lot image ...")
image = cv2.imread("parking_lot.png")

# Clear previous coordinates
with open("slot_coordinates.txt", "w") as file:
    pass

print("[INFO] Parking lot image loaded successfully!") 
print("[INFO] Click 4 corners of a parking area in order (clockwise or anticlockwise).")
print("[INFO] Press SPACE to save after marking each area.")
print("[INFO] Press ESC to exit.")

points = []
parking_lot = 0

def mouse_callback(event, x, y, flags, param): 
    if event == cv2.EVENT_LBUTTONDOWN:
        points.append((x, y))
        print(f"[DEBUG] Point clicked: {(x, y)}")

cv2.namedWindow("Parking area")
cv2.setMouseCallback("Parking area", mouse_callback)

while True:
    img_copy = cv2.resize(image.copy(), (1300, 650), interpolation=cv2.INTER_AREA)

    # Draw points and connecting lines
    for i, point in enumerate(points):
        cv2.circle(img_copy, point, 5, (0, 0, 255), -1)
        if i > 0:
            cv2.line(img_copy, points[i-1], point, (0, 255, 0), 2)

    # Draw closing line if 4 points are selected
    if len(points) == 4:
        cv2.line(img_copy, points[3], points[0], (0, 255, 0), 2)
        cv2.polylines(img_copy, [np.array(points, np.int32)], True, (255, 0, 0), 2)

    cv2.imshow("Parking area", img_copy)

    key = cv2.waitKey(5) & 0xFF

    if key == 32:  # SPACE
        if len(points) == 4:
            parking_lot += 1
            print(f"[INFO] Parking area {parking_lot} saved!")
            with open('slot_coordinates.txt', 'a') as file:
                flat = [str(coord) for point in points for coord in point]
                file.write(" ".join(flat) + "\n")
            points.clear()
        else:
            print("[WARN] You must click exactly 4 points before saving!")

    elif key == 27:  # ESC
        print("[INFO] Exiting program...")
        break

cv2.destroyAllWindows()
