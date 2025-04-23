# 🚦 Smart Traffic Management System

A smart traffic management system that uses YOLO-based vehicle detection on four camera feeds (North, South, East, West). The system:

- Detects vehicle count and emergency vehicles.
- Calculates optimal green light intervals.
- Streams real-time updates to a dashboard using FastAPI and Server-Sent Events (SSE).

---

## 🧠 Features

- Real-time object detection with YOLOv3.
- 1-second sample-based decision making.
- Emergency vehicle detection.
- Green-light optimization algorithm.
- FastAPI-based backend API.
- Live frontend dashboard with auto-refresh.

---

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/12SHIVANSH-SINGH/delta-2.git
cd delta-2
```

### 2. Set up a virtual environment (macOS + VS Code)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Download YOLOv8 weights and config files manually from here: https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n.pt


---

## ▶️ Running the Project

### 1. Start the FastAPI backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

- Backend URL: [http://localhost:8000](http://localhost:8000)
- API Feed: [http://localhost:8000/traffic_feed](http://localhost:8000/traffic_feed)

### 2. Start the frontend

Open a **new terminal tab/window**:

```bash
cd frontend
npm install
npx next dev
```

- Frontend URL: [http://localhost:3000](http://localhost:3000)

---

## 📹 Adding Camera Feeds

Place your `.mp4` files inside the `backend/videos/` folder:

```
videos/
├── north.mp4
├── south.mp4
├── east.mp4
└── west.mp4
```

> Each video represents a lane camera.

---

## 🌐 API Endpoint

- `/traffic_feed`: Provides a stream of traffic data in JSON format using Server-Sent Events.

Example output:
```json
{
  "north": { "vehicles": 12, "emergency": false, "green_time": 10 },
  "south": { "vehicles": 8,  "emergency": true,  "green_time": 20 },
  ...
}
```



