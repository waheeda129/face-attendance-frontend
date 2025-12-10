<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_zMKAxVffx9DfhFb-1SwTtJ-GKY1PL5C

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend (Flask) API

This repo now includes a lightweight Flask backend for the attendance APIs.

1. Create and activate a Python 3.11 virtualenv.
2. Install backend deps: `pip install -r requirements.txt` (root file covers Flask + CV + ONNX)
3. Start the server: `python backend/app.py` (defaults to `http://localhost:5000/api`)
4. Point the frontend at it by adding to `.env.local`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Endpoints:
- `GET /api/health`
- `GET/POST /api/students`
- `DELETE /api/students/:id`
- `GET/POST /api/attendance`
- `GET/PUT /api/settings`
- `POST /api/detect` (returns face boxes; requires OpenCV install. If `faces` is empty and response is 501, detection isn’t available on this machine.)
- `POST /api/recognize` (detection-only stub unless you install CV/runtime + model; returns `available:false` if missing)
- `GET /api/embeddings` (list stored embeddings)
- `PUT /api/embeddings` (upsert embedding for a studentId; JSON vector expected)

Recognition scaffold
- To enable detection/recognition locally: `pip install -r requirements.txt` inside your venv, then `python backend/app.py`. `/api/recognize` will still be detection-only until you add a model/embeddings and send valid frame data (base64-encoded image).
- To integrate a model: place your ONNX at `backend/model.onnx` (or set `RECOGNITION_MODEL_PATH`), populate embeddings via `PUT /api/embeddings`, and the recognizer will cosine-match and auto-log attendance above `minConfidenceThreshold`.
