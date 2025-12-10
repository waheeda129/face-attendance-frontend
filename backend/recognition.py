import base64
import json
import os
from typing import List, Dict, Any, Optional
from detection import detector
from db import fetch_embeddings

try:
    import cv2
    import numpy as np
    import onnxruntime as ort
    RUNTIME_AVAILABLE = True
except Exception:
    cv2 = None
    np = None
    ort = None
    RUNTIME_AVAILABLE = False


MODEL_PATH = os.environ.get("RECOGNITION_MODEL_PATH", os.path.join(os.path.dirname(__file__), "model.onnx"))
INPUT_SIZE = (112, 112)


class Recognizer:
    def __init__(self):
        self.available = RUNTIME_AVAILABLE and detector.available
        self.session: Optional["ort.InferenceSession"] = None
        self.embeddings = self._load_embeddings()
        if self.available and os.path.exists(MODEL_PATH):
            self._load_model()

    def _load_embeddings(self) -> Dict[str, List[float]]:
        raw = fetch_embeddings()
        parsed: Dict[str, List[float]] = {}
        for k, v in raw.items():
            try:
                parsed[k] = json.loads(v)
            except Exception:
                continue
        return parsed

    def reload_embeddings(self):
        self.embeddings = self._load_embeddings()

    def _load_model(self):
        try:
            self.session = ort.InferenceSession(
                MODEL_PATH,
                providers=["CPUExecutionProvider"],
            )
        except Exception as exc:
            print("Failed to load model:", exc)
            self.session = None
            self.available = False

    def _decode_frame(self, b64_image: str):
        if not cv2:
            return None
        try:
            img_bytes = base64.b64decode(b64_image.split(",")[-1])
            if not img_bytes:
                return None
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception:
            return None

    def _preprocess(self, frame, box) -> Optional["np.ndarray"]:
        if frame is None or cv2 is None:
            return None
        x, y, w, h = box["x"], box["y"], box["w"], box["h"]
        crop = frame[y : y + h, x : x + w]
        if crop.size == 0:
            return None
        resized = cv2.resize(crop, INPUT_SIZE)
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB).astype("float32") / 255.0
        # NCHW
        chw = np.transpose(rgb, (2, 0, 1))[None, ...]
        return chw

    def _embed(self, tensor: "np.ndarray") -> Optional["np.ndarray"]:
        if not self.session:
            return None
        input_name = self.session.get_inputs()[0].name
        output_name = self.session.get_outputs()[0].name
        out = self.session.run([output_name], {input_name: tensor})[0]
        return out[0]

    def _cosine(self, a: "np.ndarray", b: "np.ndarray") -> float:
        if np is None:
            return 0.0
        denom = (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)
        return float(np.dot(a, b) / denom)

    def recognize(self, frame_b64: str, threshold: float = 0.85) -> Dict[str, Any]:
        if not detector.available:
            return {
                "available": False,
                "message": "OpenCV not installed; detection unavailable.",
                "faces": [],
            }

        boxes = detector.detect(frame_b64)
        frame = self._decode_frame(frame_b64) if self.available else None

        if not self.available or self.session is None or not self.embeddings:
            return {
                "available": detector.available,
                "message": "Detection only. Add model + embeddings to enable recognition.",
                "faces": [
                    {
                        "box": box,
                        "studentId": None,
                        "studentName": None,
                        "confidence": 0,
                        "status": "unknown",
                    }
                    for box in boxes
                ],
            }

        faces_out = []
        for box in boxes:
            tensor = self._preprocess(frame, box)
            if tensor is None:
                continue
            embedding = self._embed(tensor)
            if embedding is None or np is None:
                continue
            best_id = None
            best_score = -1.0
            for student_id, vec in self.embeddings.items():
                try:
                    vec_np = np.array(vec, dtype="float32")
                    score = self._cosine(embedding, vec_np)
                    if score > best_score:
                        best_score = score
                        best_id = student_id
                except Exception:
                    continue
            status = "unknown"
            student_name = None
            if best_id and best_score >= threshold:
                status = "recognized"
            faces_out.append(
                {
                    "box": box,
                    "studentId": best_id if status == "recognized" else None,
                    "studentName": student_name,
                    "confidence": round(best_score, 4) if best_score >= 0 else 0,
                    "status": status,
                }
            )

        return {
            "available": True,
            "message": "Recognition executed" if faces_out else "No faces",
            "faces": faces_out,
        }


recognizer = Recognizer()
