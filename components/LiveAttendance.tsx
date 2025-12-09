import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle, AlertTriangle, User, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord } from '../types';

const LiveAttendance: React.FC = () => {
  const { students, addAttendance, settings } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recentLogs, setRecentLogs] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  // Start Webcam
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
        // Wait for metadata to load
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

  // Simulation Logic
  useEffect(() => {
    if (!isStreaming) return;

    // Simulate FPS updates
    const fpsInterval = setInterval(() => {
      setFps(Math.floor(Math.random() * (30 - 24 + 1) + 24)); // Random between 24-30
    }, 1000);

    // Simulate Face Detection Events
    const detectionInterval = setInterval(() => {
      // 40% chance to detect a student every 2.5 seconds
      if (Math.random() > 0.6 && students.length > 0) {
        handleMockDetection();
      }
    }, 2500);

    return () => {
      clearInterval(fpsInterval);
      clearInterval(detectionInterval);
    };
  }, [isStreaming, students]);

  const handleMockDetection = () => {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const isLate = Math.random() > 0.8;
    const confidence = 85 + Math.random() * 14;
    
    // Create new record
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId: randomStudent.id,
      studentName: randomStudent.name,
      timestamp: new Date().toISOString(),
      status: isLate ? 'Late' : 'Present',
      confidence: confidence,
    };

    // Update state
    setRecentLogs(prev => {
      // Dedupe: Don't add if same student detected in last 5 seconds
      if (prev.length > 0 && prev[0].studentId === randomStudent.id) {
          const timeDiff = new Date().getTime() - new Date(prev[0].timestamp).getTime();
          if (timeDiff < 5000) return prev; 
      }
      
      // Add to global context
      addAttendance(newRecord);

      return [newRecord, ...prev].slice(0, 15);
    });
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500">
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
            </div>

            {/* Simulated Bounding Box (Visual Only) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
               <div className="w-64 h-64 border-2 border-green-400/50 rounded-lg relative animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500 -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500 -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500 -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500 -mb-1 -mr-1"></div>
                  <div className="absolute -top-6 left-0 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">
                    DETECTING...
                  </div>
               </div>
            </div>
            
            {/* Scanning Line Animation */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
               <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent absolute top-0 animate-[scan_3s_linear_infinite]"></div>
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
            Simulation
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {recentLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <User className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">Waiting for detections...</p>
              <p className="text-xs text-gray-300 text-center px-4 mt-2">
                Simulating face recognition events...
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
                    <span className="text-gray-300">|</span>
                    <span className="text-green-600 font-medium">{log.confidence.toFixed(1)}% Match</span>
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  log.status === 'Present' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {log.status === 'Present' ? <CheckCircle className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for icon
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default LiveAttendance;