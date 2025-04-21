import cv2
import numpy as np
import time
from concurrent.futures import ThreadPoolExecutor

class TrafficDetector:
    def __init__(self):
        self.conf_threshold = 0.5
        self.nms_threshold = 0.4
        self.vehicles = ["car", "bus", "truck", "motorbike"]
        self.emergency_vehicles = ["ambulance", "fire", "police"]

        self.net = cv2.dnn.readNet("yolo/yolov3.weights", "yolo/yolov3.cfg")
        layer_names = self.net.getLayerNames()
        self.output_layers = [layer_names[i - 1] for i in self.net.getUnconnectedOutLayers().flatten()]
        with open("yolo/coco.names") as f:
            self.classes = [line.strip().lower() for line in f]

    def detect_objects(self, frame: np.ndarray):
        h, w = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416,416), swapRB=True, crop=False)
        self.net.setInput(blob)
        outs = self.net.forward(self.output_layers)

        boxes, confidences, class_ids = [], [], []
        for out in outs:
            for det in out:
                scores = det[5:]
                cid = np.argmax(scores)
                conf = scores[cid]
                if conf > self.conf_threshold:
                    cx, cy, bw, bh = (det[0:4] * np.array([w,h,w,h])).astype(int)
                    x, y = cx - bw//2, cy - bh//2
                    boxes.append([x,y,bw,bh]); confidences.append(float(conf)); class_ids.append(cid)

        idxs = cv2.dnn.NMSBoxes(boxes, confidences, self.conf_threshold, self.nms_threshold)
        count, emergency = 0, False
        if len(idxs):
            for i in idxs.flatten():
                name = self.classes[class_ids[i]]
                if any(v in name for v in self.vehicles):
                    count += 1
                    if any(e in name for e in self.emergency_vehicles):
                        emergency = True
                        break
        return count, emergency

detector = TrafficDetector()

def sample_cycle(sources: dict) -> dict:
    latest = {lane: None for lane in sources}
    caps = {lane: cv2.VideoCapture(src) for lane, src in sources.items()}
    start = time.time()

    while time.time() - start < 1.0:
        for lane, cap in caps.items():
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()
            if ret:
                latest[lane] = frame

    for cap in caps.values(): cap.release()

    return {lane: dict(zip(["count","emergency"], detector.detect_objects(f)))
            for lane, f in latest.items() if f is not None}