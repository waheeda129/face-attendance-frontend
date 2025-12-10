import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertTriangle, User, Activity, Scan, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord, Student } from '../types';
import { getDefaultBaseUrl } from '../api';

const LiveAttendance: React.FC = () => {
  const { students, addAttendance, settings } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recentLogs, setRecentLogs] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [faceCount, setFaceCount] = useState(0);
  const [detectMessage, setDetectMessage] = useState<string>('Waiting for frames...');
  const [manualStudent, setManualStudent] = useState<string>('');
  const [recentlyLogged, setRecentlyLogged] = useState<Record<string, number>>({});

  const apiBase = settings.apiUrl || getDefaultBaseUrl();

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = { 
        video: { 
          width: 640, 
          height: 480, 
          deviceId: settings.cameraDeviceId ? { exact: settings.cameraDeviceId } : undefined 
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
           setIsStreaming(true);
           setError(null);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions or device connection.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [settings.cameraDeviceId]);

  // Poll FPS and detection
  useEffect(() => {
    if (!isStreaming) return;
    const fpsInterval = setInterval(() => {
      if (videoRef.current) {
        const track = (videoRef.current.srcObject as MediaStream)?.getVideoTracks()[0];
        const settings = track?.getSettings();
        setFps(settings?.frameRate ? Math.round(settings.frameRate) : 24);
      }
    }, 1000);

    const detectionInterval = setInterval(() => {
      detectFrame();
    }, 2500);

    return () => {
      clearInterval(fpsInterval);
      clearInterval(detectionInterval);
    };
  }, [isStreaming, apiBase]);

  const detectFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame: dataUrl, threshold: settings.minConfidenceThreshold / 100 }),
      });
      if (res.status === 501) {
        setDetectMessage('Recognition unavailable (backend missing CV/runtime).');
        setFaceCount(0);
        return;
      }
      if (!res.ok) {
        setDetectMessage('Recognition call failed.');
        setFaceCount(0);
        return;
      }
      const payload = await res.json();
      setFaceCount(payload.faces?.length || 0);
      // Auto-log recognized faces respecting threshold and cooldown.
      if (payload.faces?.length) {
        const now = Date.now();
        payload.faces.forEach((f: any) => {
          if (f.studentId && f.confidence && f.confidence >= settings.minConfidenceThreshold / 100) {
            const last = recentlyLogged[f.studentId] || 0;
            if (now - last > 60_000) { // 60s cooldown
              const student = students.find((s) => s.id === f.studentId);
              if (student) {
                const newRecord: AttendanceRecord = {
                  id: `${f.studentId}-${now}`,
                  studentId: student.id,
                  studentName: student.name,
                  timestamp: new Date().toISOString(),
                  status: 'Present',
                  confidence: f.confidence * 100,
                };
                addAttendance(newRecord);
                setRecentLogs((prev) => [newRecord, ...prev].slice(0, 15));
                setRecentlyLogged((prev) => ({ ...prev, [student.id]: now }));
              }
            }
          }
        });
      }
      if (payload.faces?.length) {
        const recognized = payload.faces.find((f: any) => f.studentId);
        setDetectMessage(recognized ? `Recognized ${recognized.studentName}` : 'Faces detected (unrecognized)');
      } else {
        setDetectMessage(payload.message || 'No faces detected');
      }
    } catch (err) {
      console.error('Recognition error', err);
      setDetectMessage('Recognition unavailable.');
      setFaceCount(0);
    }
  };

  const handleManualLog = () => {
    const student = students.find((s) => s.id === manualStudent);
    if (!student) return;
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      timestamp: new Date().toISOString(),
      status: 'Present',
      confidence: 0,
    };
    addAttendance(newRecord);
    setRecentLogs((prev) => [newRecord, ...prev].slice(0, 15));
    setDetectMessage('Logged manually');
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500">
      <canvas ref={canvasRef} className="hidden" />
      {/* Camera Feed Section */}
      <div className="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-lg flex flex-col justify-center items-center group">
        
        {error ? (
          <div className="text-white text-center p-6 z-20">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">System Error</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Reload System
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute w-full h-full object-cover transform scale-x-[-1]" 
              style={{ display: 'block' }}
            />
            
            {/* Status Overlays */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
              <div className="bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold font-mono flex items-center gap-2 border border-white/10">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                LIVE FEED
              </div>
              <div className="bg-black/60 backdrop-blur-md text-green-400 px-4 py-1.5 rounded-full text-xs font-bold font-mono border border-white/10 flex items-center gap-2">
                 <Activity className="w-3 h-3" />
                 {fps} FPS
              </div>
              <div className="bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold font-mono border border-white/10 flex items-center gap-2">
                 <Scan className="w-3 h-3" />
                 {detectMessage}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Logs Section */}
      <div className="w-full xl:w-[400px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[400px] xl:h-auto">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            Detection Log
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
            Backend
          </span>
        </div>

        <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
          <div className="text-sm text-gray-700 flex items-center justify-between">
            <span>Faces in frame: <strong>{faceCount}</strong></span>
            <span className="text-xs text-gray-500">{detectMessage}</span>
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={manualStudent}
              onChange={(e) => setManualStudent(e.target.value)}
            >
              <option value="">Select student to log</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
              ))}
            </select>
            <button
              onClick={handleManualLog}
              disabled={!manualStudent}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Mark
            </button>
          </div>
          <p className="text-xs text-gray-500">Automatic face recognition is pending model integration. Manual logging keeps records consistent meanwhile.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {recentLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <User className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">No attendance logs yet.</p>
              <p className="text-xs text-gray-300 text-center px-4 mt-2">
                Detect faces then mark attendance to populate this list.
              </p>
            </div>
          ) : (
            recentLogs.map((log, index) => (
              <div key={`${log.id}-${index}`} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm animate-in slide-in-from-top-2 fade-in duration-300 hover:border-indigo-100 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                  <img 
                     src={students.find(s => s.id === log.studentId)?.photoUrl} 
                     alt={log.studentName} 
                     className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate text-sm">{log.studentName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAttendance;
