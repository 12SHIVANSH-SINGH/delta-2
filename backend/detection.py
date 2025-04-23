import cv2
import numpy as np
import time
import base64
import os
import logging
from pathlib import Path
from ultralytics import YOLO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("detection")

class TrafficDetector:
    def __init__(self,
                 conf_threshold=0.4,      # confidence threshold
                 iou_threshold=0.4,       # NMS IoU threshold
                 max_count_limit=50,
                 frame_skip=0,            # process every Nth frame (0=all frames)
                 verbose=False):
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.frame_skip = frame_skip
        self.frame_counter = 0

        # exact names from COCO dataset
        self.vehicles = {"car", "bus", "motorcycle", "truck", "bicycle"}
        self.emergency_vehicles = {"ambulance", "fire engine", "police car"}

        self.verbose = verbose
        self.max_count_limit = max_count_limit

        # Load YOLOv8 with proper error handling
        try:
            # Check for model file
            model_path = Path("yolo/yolov8n.pt")  # Using YOLOv8 nano by default
            
            if not model_path.exists():
                logger.warning(f"YOLOv8 model not found at {model_path}. Attempting to download...")
                os.makedirs("yolo", exist_ok=True)
            
            # Load the model
            self.model = YOLO(str(model_path))
            
            # Set model parameters
            self.model.conf = self.conf_threshold
            self.model.iou = self.iou_threshold
            
            # Create debug directory
            os.makedirs("debug_images", exist_ok=True)
            
            # Warm up the model
            self._warmup()
            
            logger.info("TrafficDetector initialized successfully with YOLOv8")
            
        except Exception as e:
            logger.error(f"Failed to initialize YOLOv8 model: {e}")
            raise

    def _warmup(self):
        """Warm up the model with a dummy image."""
        dummy = np.zeros((640, 640, 3), dtype=np.uint8)
        self.model(dummy, verbose=False)
        logger.info("Model warm-up complete")

    def preprocess(self, frame: np.ndarray) -> np.ndarray:
        """Denoise + contrast‑enhance before detection."""
        try:
            if frame is None:
                raise ValueError("Empty frame received")
                
            # Resize if too large (for performance)
            h, w = frame.shape[:2]
            if max(h, w) > 1200:
                scale = 1200 / max(h, w)
                frame = cv2.resize(frame, (int(w * scale), int(h * scale)))
            
            # Apply noise reduction
            blurred = cv2.GaussianBlur(frame, (5, 5), 0)
            
            # Enhance contrast
            hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            v_eq = clahe.apply(v)
            hsv_eq = cv2.merge([h, s, v_eq])
            
            return cv2.cvtColor(hsv_eq, cv2.COLOR_HSV2BGR)
        except Exception as e:
            logger.error(f"Preprocessing error: {e}")
            return frame  # Return original frame if preprocessing fails

    def detect_objects(self, frame: np.ndarray):
        """Detect vehicles in the frame and return count, emergency flag, and annotated image."""
        try:
            if frame is None:
                logger.error("Empty frame received in detect_objects")
                return 0, False, ""
                
            # Frame skipping for performance if needed
            self.frame_counter += 1
            if self.frame_skip > 0 and self.frame_counter % (self.frame_skip + 1) != 0:
                # Simple copy of frame with no detection
                _, jpg = cv2.imencode('.jpg', frame)
                img_b64 = base64.b64encode(jpg).decode('utf-8')
                return 0, False, img_b64

            # Make a copy for drawing
            draw_frame = frame.copy()
                
            # 0) preprocess
            start_time = time.time()
            proc = self.preprocess(frame)

            # 1) Run YOLOv8 inference
            results = self.model(proc, verbose=False)
            
            # 2) Process results
            count = 0
            emergency = False
            
            # Get the first result (only one image was processed)
            result = results[0]
            
            # Draw bounding boxes and count vehicles
            for i, det in enumerate(result.boxes):
                if i >= self.max_count_limit:
                    break
                    
                # Get box coordinates, confidence and class
                x1, y1, x2, y2 = map(int, det.xyxy[0])
                conf = float(det.conf[0])
                cls_id = int(det.cls[0])
                cls_name = result.names[cls_id].lower()
                
                # Count vehicles
                if cls_name in self.vehicles:
                    count += 1
                if cls_name in self.emergency_vehicles:
                    emergency = True
                    count += 1
                
                # Draw box and label
                color = (0, 0, 255) if cls_name in self.emergency_vehicles else (0, 255, 0)
                cv2.rectangle(draw_frame, (x1, y1), (x2, y2), color, 2)
                
                label = f"{cls_name} {conf:.2f}"
                cv2.putText(draw_frame, label, (x1, y1 - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                            color, 2)

            process_time = time.time() - start_time
            if self.verbose:
                logger.info(f"[DETECT] {count} vehicles, emergency={emergency}, time={process_time:.3f}s")

            # Cap count and optionally save debug image for unusual spikes
            if count > self.max_count_limit:
                count = self.max_count_limit
                if self.verbose:
                    ts = time.strftime("%Y%m%d-%H%M%S")
                    fname = f"debug_images/spike_{ts}.jpg"
                    cv2.imwrite(fname, draw_frame)
                    logger.info(f"[DEBUG] saved spike frame to {fname}")

            # Add processing metrics to the image
            cv2.putText(draw_frame, f"Process: {process_time:.3f}s", (10, 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

            # Encode and return
            _, jpg = cv2.imencode('.jpg', draw_frame)
            img_b64 = base64.b64encode(jpg).decode('utf-8')
            return count, emergency, img_b64
            
        except Exception as e:
            logger.error(f"Detection error: {e}")
            # Return empty result on error
            if frame is not None:
                _, jpg = cv2.imencode('.jpg', frame)
                img_b64 = base64.b64encode(jpg).decode('utf-8')
                return 0, False, img_b64
            return 0, False, ""

    def __del__(self):
        """Clean up resources."""
        logger.info("Releasing detector resources")


# Expose both for main.py - singleton pattern
detector = TrafficDetector(verbose=True)


def sample_cycle(sources: dict) -> dict:
    """Read each camera for ~1s, detect, and return per‑lane dict."""
    latest = {lane: None for lane in sources}
    caps = {}
    start = time.time()
    
    try:
        # Initialize video captures
        for lane, src in sources.items():
            if not os.path.exists(src):
                logger.warning(f"Video file not found: {src}")
                continue
                
            cap = cv2.VideoCapture(src)
            if not cap.isOpened():
                logger.warning(f"Failed to open video source: {src}")
                continue
                
            caps[lane] = cap
        
        # Sample frames for about 1 second
        while time.time() - start < 1.0:
            for lane, cap in caps.items():
                ret, frame = cap.read()
                if not ret:
                    # Reset video to beginning if reached end
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = cap.read()
                if ret:
                    latest[lane] = frame
    
        # Process the latest frame from each lane
        results = {}
        for lane, frame in latest.items():
            if frame is not None:
                count, emergency, image = detector.detect_objects(frame)
                results[lane] = {"count": count, "emergency": emergency, "image": image}
            else:
                results[lane] = {"count": 0, "emergency": False, "image": ""}
                
        return results
        
    except Exception as e:
        logger.error(f"Error in sample_cycle: {e}")
        return {lane: {"count": 0, "emergency": False, "image": ""} for lane in sources}
        
    finally:
        # Clean up video captures
        for cap in caps.values():
            cap.release()
