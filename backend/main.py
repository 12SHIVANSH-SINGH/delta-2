from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from detection import sample_cycle
from optimizer import optimizer
import time, json

app = FastAPI()

# ✅ Enable CORS so frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can set this to ["http://localhost:8080"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

camera_sources = {
    "North": "videos/north.mp4",
    "South": "videos/south.mp4",
    "East": "videos/east.mp4",
    "West": "videos/west.mp4",
}

@app.get("/traffic_feed")
async def traffic_feed():
    def stream():
        while True:
            data = sample_cycle(camera_sources)
            timings = optimizer.compute_green_time(data)
            payload = {
                "lanes": data,
                "signal_times": timings,
                "timestamp": time.strftime("%H:%M:%S")
            }
            yield f"data: {json.dumps(payload)}\n\n"
            time.sleep(1.5)
    return StreamingResponse(stream(), media_type="text/event-stream")
