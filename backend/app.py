from datetime import datetime
import os
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import (
    init_db,
    fetch_students,
    insert_student,
    delete_student,
    fetch_attendance,
    insert_attendance,
    fetch_settings as db_fetch_settings,
    update_settings as db_update_settings,
    save_face_image,
    fetch_embeddings,
    upsert_embedding,
    delete_embedding,
)
from detection import detector

app = Flask(__name__)
CORS(app)

init_db()
# Recognizer is loaded after DB init to ensure embeddings table exists.
from recognition import recognizer  # noqa: E402


def now_iso() -> str:
    return datetime.utcnow().isoformat()


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": now_iso()})


@app.get("/api/students")
def get_students():
    return jsonify(fetch_students())


@app.post("/api/students")
def add_student():
    data = request.get_json() or {}
    student_id = data.get("id") or str(uuid.uuid4())

    photo_b64 = data.get("photoBase64")
    photo_path = None
    if photo_b64:
        photo_path = save_face_image(student_id, base64_to_bytes(photo_b64))

    student = {
        "id": student_id,
        "name": data.get("name") or "Unnamed",
        "studentId": data.get("studentId") or f"AUTO-{student_id[:6]}",
        "department": data.get("department") or "General",
        "email": data.get("email") or "",
        "photoUrl": photo_path or data.get("photoUrl") or "",
        "status": data.get("status") or "Active",
    }
    insert_student(student)
    # If embedding provided directly, persist it.
    if data.get("embedding"):
        try:
            upsert_embedding(student_id, json.dumps(data.get("embedding")))
            recognizer.reload_embeddings()
        except Exception as exc:
            print("Failed to save embedding", exc)
    return jsonify(student), 201


@app.delete("/api/students/<student_id>")
def delete_student_api(student_id: str):
    removed = delete_student(student_id)
    delete_embedding(student_id)
    recognizer.reload_embeddings()
    if not removed:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"success": True})


@app.get("/api/attendance")
def get_attendance():
    return jsonify(fetch_attendance())


@app.post("/api/attendance")
def add_attendance():
    data = request.get_json() or {}
    record = {
        "id": data.get("id") or str(uuid.uuid4()),
        "studentId": data.get("studentId"),
        "studentName": data.get("studentName"),
        "timestamp": data.get("timestamp") or now_iso(),
        "status": data.get("status") or "Present",
        "confidence": data.get("confidence") or 0,
    }
    insert_attendance(record)
    return jsonify(record), 201


@app.get("/api/settings")
def get_settings():
    return jsonify(db_fetch_settings())


@app.put("/api/settings")
def update_settings():
    data = request.get_json() or {}
    saved = db_update_settings(data)
    return jsonify(saved)


@app.get("/api/embeddings")
def get_embeddings():
    return jsonify(fetch_embeddings())


@app.put("/api/embeddings")
def put_embedding():
    data = request.get_json() or {}
    student_id = data.get("studentId")
    vector = data.get("vector")
    if not student_id or vector is None:
        return jsonify({"error": "studentId and vector are required"}), 400
    try:
        upsert_embedding(student_id, json.dumps(vector))
        recognizer.reload_embeddings()
        return jsonify({"success": True})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.post("/api/detect")
def detect_faces():
    data = request.get_json() or {}
    frame_b64 = data.get("frame")
    if not frame_b64:
        return jsonify({"error": "frame is required"}), 400
    if not detector.available:
        return jsonify({"faces": [], "available": False, "message": "OpenCV not installed; detection unavailable."}), 501
    boxes = detector.detect(frame_b64)
    # Recognition is not implemented yet; only detection boxes returned.
    return jsonify({"faces": boxes, "available": True})


@app.post("/api/recognize")
def recognize():
    data = request.get_json() or {}
    frame_b64 = data.get("frame")
    threshold = data.get("threshold")
    if not frame_b64:
        return jsonify({"error": "frame is required"}), 400
    try:
        threshold_val = float(threshold) if threshold is not None else 0.85
    except Exception:
        threshold_val = 0.85
    result = recognizer.recognize(frame_b64, threshold_val)
    status_code = 200 if result.get("available", False) else 501
    return jsonify(result), status_code


def base64_to_bytes(b64_string: str) -> bytes:
    import base64

    return base64.b64decode(b64_string.split(",")[-1])


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
