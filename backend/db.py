import os
import sqlite3
from contextlib import contextmanager
from typing import Any, Dict, List, Tuple

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data.db")
STORAGE_DIR = os.path.join(BASE_DIR, "storage", "faces")

os.makedirs(STORAGE_DIR, exist_ok=True)


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                studentId TEXT UNIQUE,
                department TEXT,
                email TEXT,
                photoPath TEXT,
                status TEXT
            )
        """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS attendance (
                id TEXT PRIMARY KEY,
                studentId TEXT,
                studentName TEXT,
                timestamp TEXT,
                status TEXT,
                confidence REAL
            )
        """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS embeddings (
                studentId TEXT PRIMARY KEY,
                vector TEXT,
                updatedAt TEXT
            )
        """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """
        )
        conn.commit()
    seed_settings()


def seed_settings():
    defaults = {
        "cameraDeviceId": "",
        "minConfidenceThreshold": "85",
        "apiUrl": "http://localhost:5000/api",
        "theme": "light",
    }
    with get_conn() as conn:
        cur = conn.cursor()
        for key, value in defaults.items():
            cur.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (key, value)
            )
        conn.commit()


def fetch_students() -> List[Dict[str, Any]]:
    with get_conn() as conn:
        cur = conn.cursor()
        rows = cur.execute(
            "SELECT id, name, studentId, department, email, photoPath, status FROM students ORDER BY name"
        ).fetchall()
    return [
        {
            "id": r[0],
            "name": r[1],
            "studentId": r[2],
            "department": r[3],
            "email": r[4],
            "photoUrl": r[5],
            "status": r[6] or "Active",
        }
        for r in rows
    ]


def insert_student(student: Dict[str, Any]) -> Dict[str, Any]:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO students (id, name, studentId, department, email, photoPath, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (
                student["id"],
                student.get("name"),
                student.get("studentId"),
                student.get("department"),
                student.get("email"),
                student.get("photoUrl"),
                student.get("status"),
            ),
        )
    return student


def delete_student(student_id: str) -> bool:
    with get_conn() as conn:
        cur = conn.cursor()
        res = cur.execute("DELETE FROM students WHERE id = ?", (student_id,))
        return res.rowcount > 0


def fetch_attendance() -> List[Dict[str, Any]]:
    with get_conn() as conn:
        cur = conn.cursor()
        rows = cur.execute(
            "SELECT id, studentId, studentName, timestamp, status, confidence FROM attendance ORDER BY timestamp DESC"
        ).fetchall()
    return [
        {
            "id": r[0],
            "studentId": r[1],
            "studentName": r[2],
            "timestamp": r[3],
            "status": r[4],
            "confidence": r[5],
        }
        for r in rows
    ]


def insert_attendance(record: Dict[str, Any]) -> Dict[str, Any]:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO attendance (id, studentId, studentName, timestamp, status, confidence)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                record["id"],
                record.get("studentId"),
                record.get("studentName"),
                record.get("timestamp"),
                record.get("status"),
                record.get("confidence"),
            ),
        )
    return record


def fetch_settings() -> Dict[str, Any]:
    with get_conn() as conn:
        cur = conn.cursor()
        rows = cur.execute("SELECT key, value FROM settings").fetchall()
    raw = {k: v for k, v in rows}
    if "minConfidenceThreshold" in raw:
        try:
            raw["minConfidenceThreshold"] = int(raw["minConfidenceThreshold"])
        except Exception:
            raw["minConfidenceThreshold"] = 85
    return raw


def update_settings(values: Dict[str, Any]) -> Dict[str, Any]:
    with get_conn() as conn:
        cur = conn.cursor()
        for key, value in values.items():
            cur.execute(
                "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                (key, str(value)),
            )
    return fetch_settings()


def save_face_image(student_id: str, data_bytes: bytes) -> str:
    filename = f"{student_id}.jpg"
    path = os.path.join(STORAGE_DIR, filename)
    with open(path, "wb") as f:
        f.write(data_bytes)
    return path


def fetch_embeddings() -> Dict[str, Any]:
    with get_conn() as conn:
        cur = conn.cursor()
        rows = cur.execute("SELECT studentId, vector FROM embeddings").fetchall()
    return {student_id: vector for student_id, vector in rows}


def upsert_embedding(student_id: str, vector_json: str):
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO embeddings (studentId, vector, updatedAt)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(studentId) DO UPDATE SET vector=excluded.vector, updatedAt=excluded.updatedAt
        """,
            (student_id, vector_json),
        )


def delete_embedding(student_id: str):
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM embeddings WHERE studentId = ?", (student_id,))
