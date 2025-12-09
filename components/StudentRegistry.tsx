import React, { useState, useRef } from 'react';
import { Plus, Search, Trash2, Edit2, Camera, X } from 'lucide-react';
import { Student } from '../types';
import { useApp } from '../context/AppContext';

const StudentRegistry: React.FC = () => {
  const { students, addStudent, removeStudent } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    studentId: '',
    department: '',
    status: 'Active'
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera init failed", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleAddStudent = () => {
    // Basic validation
    if (!newStudent.name || !newStudent.studentId) return;

    const student: Student = {
      id: Date.now().toString(),
      name: newStudent.name!,
      studentId: newStudent.studentId!,
      department: newStudent.department || 'General',
      email: `${newStudent.name?.split(' ')[0].toLowerCase()}@uni.edu`,
      photoUrl: capturedImage || `https://picsum.photos/200/200?random=${Date.now()}`,
      status: 'Active'
    };

    addStudent(student);
    setIsModalOpen(false);
    setCapturedImage(null);
    setNewStudent({ name: '', studentId: '', department: '', status: 'Active' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student profile?')) {
      removeStudent(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add New Student
        </button>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="p-6 flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{student.studentId}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {student.department}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(student.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Register New Student</h2>
                <p className="text-sm text-gray-500 mt-1">Enter student details and capture reference photos.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Student ID</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newStudent.studentId}
                    onChange={e => setNewStudent({...newStudent, studentId: e.target.value})}
                    placeholder="e.g. CS-2024"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <select 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newStudent.department}
                    onChange={e => setNewStudent({...newStudent, department: e.target.value})}
                  >
                    <option value="">Select Dept</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Arts">Arts</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>
              </div>

              {/* Photo Capture Area */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Face Registration</label>
                
                {!isCameraOpen && !capturedImage && (
                  <div 
                    onClick={startCamera}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition">
                      <Camera className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Click to Capture Photo</p>
                    <p className="text-xs text-gray-500 mt-1">Ensure good lighting</p>
                  </div>
                )}

                {isCameraOpen && (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    <canvas ref={canvasRef} className="hidden" />
                    <button 
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white text-black font-medium rounded-full shadow-lg hover:bg-gray-100"
                    >
                      Capture Frame
                    </button>
                  </div>
                )}

                {capturedImage && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video group">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => setCapturedImage(null)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Retake
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  stopCamera();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddStudent}
                disabled={!capturedImage || !newStudent.name}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistry;
