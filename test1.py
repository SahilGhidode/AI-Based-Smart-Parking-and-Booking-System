import cv2
import cvzone
import numpy as np
import pickle

cap = cv2.VideoCapture("parking.mp4")

drawing = False
area_names = []
try:
    with open("parking_area","rb") as f:
        data = pickle.load(f)
        polylines,area_names = data['polylines'],data['area_names']
except:
    polylines = []


points=[]
current_name = " "
area_counter = 1

def draw(event,x,y,flags,param):
    global points,drawing,area_counter
    drawing=True
    if event==cv2.EVENT_LBUTTONDOWN:
        # print(x,y)
        points=[(x,y)]
    elif event==cv2.EVENT_MOUSEMOVE:
        if drawing==True:
            points.append((x,y))
    elif event==cv2.EVENT_LBUTTONUP:
        drawing = False
        # current_name = input('area name:-')
        current_name = area_counter
        if current_name:
            # area_names.append(current_name)
            area_names.append(str(area_counter))
            area_counter += 1
            polylines.append(np.array(points,np.int32))



while True:
    ret, frame = cap.read()
    if not ret:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Restart video
        continue
    frame = cv2.resize(frame, (800, 500))
    for i,polyline in enumerate(polylines):
        print(i)
        cv2.polylines(frame,[polyline],isClosed=True,color=(0,0,255),thickness=2)
        cvzone.putTextRect(frame,f'{area_names[i]}',tuple(polyline[0]),1,1)
    cv2.imshow('FRAME', frame)
    cv2.setMouseCallback('FRAME',draw)
    key = cv2.waitKey(100) & 0xFF
    if key == ord('s'):
        with open("parking_area","wb") as f:
            data = {'polylines':polylines,'area_names':area_names}
            pickle.dump(data,f)
    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()