import base64
from typing import List, Dict

try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except Exception:
    cv2 = None
    np = None
    OPENCV_AVAILABLE = False


class Detector:
    def __init__(self):
        self.available = OPENCV_AVAILABLE
        if self.available:
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            )
        else:
            self.face_cascade = None

    def detect(self, b64_image: str) -> List[Dict[str, int]]:
        if not self.available or self.face_cascade is None:
            # CV stack missing; detection not available.
            return []
        try:
            img_bytes = base64.b64decode(b64_image.split(",")[-1])
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 5)
            results = []
            for (x, y, w, h) in faces:
                results.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})
            return results
        except Exception as exc:  # pragma: no cover
            print("Detection failed", exc)
            return []


detector = Detector()
