import cv2
import pickle
from ultralytics import YOLO
import pandas as pd
import numpy as np
import cvzone

with open("parking_area","rb") as f:
    data=pickle.load(f)
    polylines,area_names = data['polylines'],data['area_names']

my_file = open("coco.txt","r")
data = my_file.read()
class_list = data.split("\n")

model = YOLO("yolov8s.pt")


cap = cv2.VideoCapture("parking.mp4")


count = 0

while True:
    ret,frame = cap.read()
    if not ret:
        cap.set(cv2.CAP_PROP_POS_FRAMES,0)
        continue

    count+=1
    if count%3 !=0:
        continue

    frame = cv2.resize(frame,(800,500))
    frame = cv2.convertScaleAbs(frame, alpha=1.2, beta=20)
    frame_copy = frame.copy()
    results = model.predict(frame)
    a=results[0].boxes.data
    px = pd.DataFrame(a).astype("float")
    list1 = []
    for index,row in px.iterrows():
        x1 = int(row[0])
        y1 = int(row[1])
        x2 = int(row[2])
        y2 = int(row[3])
        confidence =float(row[4])
        d = int(row[5])
        c = class_list[d]
        cx = int(x1+x2)//2
        cy = int(y1+y2)//2
        if confidence > 0.3 and 'car' in c:
            list1.append([cx,cy])
            cv2.rectangle(frame,(x1,y1),(x2,y2),(255,255,255),2)
    for i,polyline in enumerate(polylines):
        cv2.polylines(frame,[polyline],isClosed=True,color=(0,255,0),thickness=2)
        cvzone.putTextRect(frame,f'{area_names[i]}',tuple(polyline[0]),1,1)
        for i1 in list1:
            #  prit(i1)
            cx1=i1[0]
            cy1=i1[1]
            result = cv2.pointPolygonTest(polyline,((cx1,cy1)),False)
            # print(result)
            if result >=0:
                cv2.circle(frame,(cx1,cy1),5,(255,0,0),-1)
                cv2.polylines(frame,[polyline],isClosed=True,color=(0,0,255),thickness=2)


    cv2.imshow('FRAME',frame)
    key = cv2.waitKey(10) & 0xFF
    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
