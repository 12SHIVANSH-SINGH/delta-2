# 🚦 Smart Traffic Management System

A smart traffic management system that uses YOLO-based vehicle detection on four camera feeds (North, South, East, West). The system:

- Detects vehicle count and emergency vehicles.
- Calculates optimal green light intervals.
- Streams real-time updates to a dashboard using FastAPI and Server-Sent Events (SSE).

---

## 📁 Project Structure

```
traffic-management/
├── backend/
│   ├── detection.py
│   ├── optimizer.py
│   ├── main.py
│   ├── requirements.txt
│   ├── videos/              # 🎥 Camera feed videos
│   │   ├── north.mp4
│   │   ├── south.mp4
│   │   ├── east.mp4
│   │   └── west.mp4
│   └── yolo/                # 🤖 YOLO model files
│       ├── yolov3.weights
│       ├── yolov3.cfg
│       └── coco.names
├── frontend/                # Next.js frontend
│   ├── pages/
│   ├── components/
│   ├── styles/
│   ├── public/
│   ├── package.json
│   └── next.config.js
└── README.md
```

---

## 🧠 Features

- Real-time object detection with YOLOv3.
- 1-second sample-based decision making.
- Emergency vehicle detection.
- Green-light optimization algorithm.
- FastAPI-based backend API.
- Live Next.js frontend dashboard with auto-refresh.

---

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/traffic-management.git
cd traffic-management
```

### 2. Set up the Backend

#### For Windows:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### For macOS/Linux:

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Download YOLOv3 files

#### Automatic download

```bash
cd yolo

# For Windows
curl -O https://pjreddie.com/media/files/yolov3.weights
curl -O https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg
curl -O https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names

# For macOS/Linux
wget https://pjreddie.com/media/files/yolov3.weights
wget https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg
wget https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names
```

> Alternatively, download the files manually and place them inside `backend/yolo/` directory.

### 4. Set up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install
```

---

## ▶️ Running the Project

### 1. Start the FastAPI backend

First terminal window:

#### For Windows:

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

#### For macOS/Linux:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

- Backend API will be available at: [http://localhost:8000](http://localhost:8000)
- API Feed: [http://localhost:8000/traffic_feed](http://localhost:8000/traffic_feed)

### 2. Start the Next.js frontend

Second terminal window:

```bash
cd frontend
npx next dev
```

- Frontend will be available at: [http://localhost:3000](http://localhost:3000)

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
  "east": { "vehicles": 5, "emergency": false, "green_time": 8 },
  "west": { "vehicles": 15, "emergency": false, "green_time": 15 }
}
```

## 🔄 Development Workflow

1. Make changes to the backend code and the server will automatically reload thanks to the `--reload` flag
2. Make changes to the Next.js frontend and the pages will automatically update thanks to Next.js hot reloading
3. Data from the backend streams to the frontend in real-time via SSE

---

## 🛠️ Troubleshooting

### Common Issues

- **YOLO model files not loading**: Ensure the paths in `detection.py` match your project structure
- **Video files not found**: Check that your video files are properly named and located in `backend/videos/`
- **CORS errors**: If you're experiencing CORS issues, check the CORS configuration in `main.py`

---

## 📝 Additional Notes

- The backend requires OpenCV for video processing
- For performance reasons, YOLOv3 is recommended to run on a system with CUDA-compatible GPU