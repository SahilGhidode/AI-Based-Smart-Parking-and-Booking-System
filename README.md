# 🚗 Smart Parking System Using YOLO, OpenCV, Node.js & Next.js

A software-driven **Smart Parking Management System** that utilizes computer vision and artificial intelligence to detect parking slot occupancy, analyze usage patterns, and predict future demand. This system replaces traditional sensor-based parking solutions with a scalable, camera-based intelligent platform.

---

## 📌 Table of Contents

* Overview
* Features
* System Architecture
* Technology Stack
* Project Structure
* Installation
* Usage
* Machine Learning Models
* Results
* Future Enhancements
* License

---

## 📖 Overview

With the rapid increase in urban vehicles, traffic congestion and fuel wastage have become major challenges. Inefficient parking management is one of the primary causes. Traditional parking systems rely on physical sensors that are costly and difficult to maintain.

This project proposes a **camera-based smart parking system** using:

* YOLOv8 for vehicle detection
* OpenCV for real-time image processing
* Node.js & Express for backend services
* Next.js for frontend dashboard
* Machine Learning models for prediction

The system provides real-time slot monitoring and predictive analytics without expensive hardware.

---

## ✨ Features

✅ Real-time vehicle detection using YOLOv8

✅ Parking slot occupancy monitoring

✅ Motion-based frame optimization

✅ RESTful backend APIs

✅ Interactive web dashboard

✅ Predictive parking demand analysis

✅ User-friendly interface

✅ Scalable and cost-efficient design

---

## 🏗️ System Architecture

```
Camera → OpenCV → YOLOv8 → Backend API → Database → Next.js Dashboard
```

1. Cameras capture parking area footage
2. OpenCV processes video frames
3. YOLO detects vehicles
4. Backend updates slot status
5. Frontend displays real-time availability

---

## 💻 Technology Stack

### Computer Vision

* Python
* OpenCV
* YOLOv8

### Backend

* Node.js
* Express.js
* REST API
* PostgreSQL

### Frontend

* Next.js
* React.js
* Tailwind CSS / CSS

### Machine Learning

* Random Forest
* Regression Models
* Scikit-learn

---

## 📁 Project Structure

```
Smart-Parking-System/
│
├── vision/
│   ├── detect.py
│   ├── motion.py
│   └── yolo_model.pt
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── config/
│
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── public/
│
├── dataset/
├── docs/
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

* Node.js (v16+)
* Python (3.8+)
* PostgreSQL
* Git

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/smart-parking-system.git
cd smart-parking-system
```

---

### 2️⃣ Setup Computer Vision

```bash
cd vision
pip install -r requirements.txt
```

Download YOLOv8 weights and place in `vision/` folder.

---

### 3️⃣ Setup Backend

```bash
cd backend
npm install
npm start
```

---

### 4️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Open browser at:

```
http://localhost:3000
```

---

## ▶️ Usage

1. Start camera feed
2. Run detection script
3. Launch backend server
4. Open frontend dashboard
5. Monitor real-time parking slots

---

## 🤖 Machine Learning Models

### Random Forest

* Used for parking demand forecasting
* Trained on historical occupancy data

### Regression Models

* Predict parking duration
* Estimate future occupancy trends

### Input Features

* Time
* Date
* Slot usage history
* Vehicle frequency

---

## 📊 Results

| Model         | Task                 | Accuracy / Score |
| ------------- | -------------------- | ---------------- |
| YOLOv8        | Vehicle Detection    | High Precision   |
| Random Forest | Occupancy Prediction | 96.80%           |
| Regression    | Duration Prediction  | 0.9730           |

The system outperformed traditional sensor-based solutions and achieved high prediction reliability.

---

## 🚀 Future Enhancements

🔹 Mobile application integration

🔹 Online parking reservation

🔹 Payment gateway

🔹 Cloud deployment (AWS / GCP)

🔹 License plate recognition

🔹 Smart navigation

🔹 AI-based anomaly detection

---

## 📜 License

This project is licensed under the MIT License.

---

## 👤 Author

Sahil Ghidode – Backend & Database

Ranu Patidar – Machine Learning Model

Richa Mishra – Computer Vision & Image Processing

Ruchi verma 4 – Frontend & Project Integration

---

⭐ If you like this project, don’t forget to star the repository!
