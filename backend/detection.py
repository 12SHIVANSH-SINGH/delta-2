import cv2, numpy as np, time, base64, os, logging
from pathlib import Path
from ultralytics import YOLO

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("detection")

class TrafficDetector:
    def __init__(self,
                 conf_threshold=0.40,
                 iou_threshold=0.45,
                 max_count_limit=50,
                 frame_skip=0,
                 verbose=False):

        self.conf_threshold = conf_threshold
        self.iou_threshold  = iou_threshold
        self.frame_skip     = frame_skip
        self.frame_counter  = 0
        self.max_count_limit = max_count_limit
        self.verbose        = verbose

        self.vehicles   = {"car", "bus", "motorcycle", "truck", "bicycle"}
        self.emergency_vehicles = {"ambulance", "fire engine", "police car"}

        model_path = Path("yolo/yolov8n.pt")
        os.makedirs("yolo", exist_ok=True)
        os.makedirs("debug_images", exist_ok=True)

        self.model  = YOLO(str(model_path))
        self.model.conf = self.conf_threshold
        self.model.iou  = self.iou_threshold
        self.stride = int(max(self.model.stride))                # model stride
        self.imgsz  = (640, 640)                                 # force 640×640

        self._warmup()

    # ─────────────────────────────────────────────────────────────────────────

    def _warmup(self):
        self.model(np.zeros((self.imgsz[0], self.imgsz[1], 3), dtype=np.uint8), verbose=False)

    # precise letter‑box resize keeping aspect --------------------------------
    def _resize_pad(self, frame: np.ndarray):
        h0, w0 = frame.shape[:2]
        r = min(self.imgsz[0] / h0, self.imgsz[1] / w0)
        nh, nw = int(round(h0 * r)), int(round(w0 * r))
        pad_h, pad_w = self.imgsz[0] - nh, self.imgsz[1] - nw
        top, left = pad_h // 2, pad_w // 2

        resized = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_LINEAR)
        img = cv2.copyMakeBorder(resized, top, pad_h - top, left, pad_w - left,
                                 cv2.BORDER_CONSTANT, value=(114, 114, 114))
        return img, r, left, top

    # optional denoise / contrast boost --------------------------------------
    def preprocess(self, frame: np.ndarray) -> np.ndarray:
        blurred = cv2.GaussianBlur(frame, (3, 3), 0)
        lab = cv2.cvtColor(blurred, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        l = cv2.equalizeHist(l)
        return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)

    # main public API ---------------------------------------------------------
    def detect_objects(self, frame: np.ndarray):
        try:
            if frame is None:
                return 0, False, ""

            self.frame_counter += 1
            if self.frame_skip and self.frame_counter % (self.frame_skip + 1):
                _, jpg = cv2.imencode(".jpg", frame)
                return 0, False, base64.b64encode(jpg).decode()

            draw = frame.copy()
            proc = self.preprocess(frame)
            blob, r, offx, offy = self._resize_pad(proc)

            res = self.model(blob, imgsz=self.imgsz, verbose=False)[0]

            count, emergency = 0, False
            for box, conf, cls in zip(res.boxes.xyxy.cpu().numpy(),
                                      res.boxes.conf.cpu().numpy(),
                                      res.boxes.cls.cpu().numpy()):

                if conf < self.conf_threshold:       # extra guard
                    continue

                cls_name = res.names[int(cls)].lower()
                x1, y1, x2, y2 = box
                # undo padding‑scale
                x1 = int((x1 - offx) / r);  x2 = int((x2 - offx) / r)
                y1 = int((y1 - offy) / r);  y2 = int((y2 - offy) / r)

                if cls_name in self.vehicles:
                    count += 1
                if cls_name in self.emergency_vehicles:
                    emergency = True
                    count += 1

                colour = (0, 0, 255) if cls_name in self.emergency_vehicles else (0, 255, 0)
                cv2.rectangle(draw, (x1, y1), (x2, y2), colour, 2)
                cv2.putText(draw, f"{cls_name} {conf:.2f}", (x1, y1 - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, colour, 1)

            count = min(count, self.max_count_limit)

            _, jpg = cv2.imencode(".jpg", draw, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
            return count, emergency, base64.b64encode(jpg).decode()

        except Exception as e:
            logger.error(f"Detection error: {e}")
            _, jpg = cv2.imencode(".jpg", frame)
            return 0, False, base64.b64encode(jpg).decode()

    def __del__(self):
        logger.info("Releasing detector resources")


# singleton instance exposed exactly like before
detector = TrafficDetector(verbose=False)

def sample_cycle(sources: dict) -> dict:
    latest, caps, start = {l: None for l in sources}, {}, time.time()
    try:
        for lane, src in sources.items():
            cap = cv2.VideoCapture(src)
            if cap.isOpened():
                caps[lane] = cap

        while time.time() - start < 1.0:
            for lane, cap in caps.items():
                ok, f = cap.read()
                if not ok:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ok, f = cap.read()
                if ok:
                    latest[lane] = f

        res = {}
        for lane, f in latest.items():
            if f is not None:
                c, e, img = detector.detect_objects(f)
                res[lane] = {"count": c, "emergency": e, "image": img}
            else:
                res[lane] = {"count": 0, "emergency": False, "image": ""}
        return res
    finally:
        for cap in caps.values():
            cap.release()
