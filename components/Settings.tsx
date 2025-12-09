import React, { useState, useEffect } from 'react';
import { Save, Camera, Server, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  
  // Local state for form handling before save
  const [localSettings, setLocalSettings] = useState(settings);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Sync local state if global settings change (e.g. from elsewhere, though unlikely here)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    // Mock fetching devices
    navigator.mediaDevices.enumerateDevices().then(devs => {
      setDevices(devs.filter(d => d.kind === 'videoinput'));
    });
  }, []);

  const handleSave = () => {
    updateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-500">Configure recognition parameters and hardware.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Camera Section */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Camera Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Input Device</label>
              <select 
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50"
                value={localSettings.cameraDeviceId}
                onChange={e => setLocalSettings({...localSettings, cameraDeviceId: e.target.value})}
              >
                <option value="">Default Camera</option>
                {devices.map((device, idx) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recognition Settings */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recognition Thresholds</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700">Minimum Confidence Score</label>
                <span className="text-sm font-bold text-indigo-600">{localSettings.minConfidenceThreshold}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="99" 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={localSettings.minConfidenceThreshold}
                onChange={e => setLocalSettings({...localSettings, minConfidenceThreshold: parseInt(e.target.value)})}
              />
              <p className="text-xs text-gray-500">Higher values reduce false positives but might miss faces in poor lighting.</p>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Backend Connection</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">API Endpoint URL</label>
            <input 
              type="text" 
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={localSettings.apiUrl}
              onChange={e => setLocalSettings({...localSettings, apiUrl: e.target.value})}
              placeholder="http://localhost:5000/api"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {isSaved && <span className="text-green-600 font-medium flex items-center gap-1">Settings saved successfully!</span>}
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
