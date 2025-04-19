import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAdminStore } from '../store/adminStore';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const navigate = useNavigate();
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [student, setStudent] = useState<{ id: string; name: string; photoCount: number; isCompleted: boolean; photos: any[] } | null>(null);
  const { isSubmissionOpen } = useAdminStore();
  const [showThankYou, setShowThankYou] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      navigate('/');
      return;
    }

    const fetchStudent = async () => {
      const studentDoc = await getDoc(doc(db, 'users', studentId));
      
      if (studentDoc.exists()) {
        const data = studentDoc.data();
        setStudent({
          id: studentDoc.id,
          ...data as { name: string; photoCount: number; isCompleted: boolean; photos: any[] }
        });
        setPhotos((data.photos || []).map((p: any) => p.imageData));
      } else {
        navigate('/');
      }
    };

    fetchStudent();
  }, [navigate]);

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      const photoData = canvas.toDataURL('image/jpeg');
      setCurrentPhoto(photoData);
      setShowConfirmation(true);

      // Stop the camera stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error capturing photo:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setPermissionError('Camera access was denied. Please allow camera access and try again.');
      } else {
        setPermissionError('An error occurred while capturing the photo. Please try again.');
      }
    }
  };

  const handleConfirmPhoto = async () => {
    if (!currentPhoto || !student) return;

    try {
      // Get existing photos array
      const studentDoc = await getDoc(doc(db, 'users', student.id));
      const existingPhotos = studentDoc.data()?.photos || [];

      // Add new photo to the array
      const updatedPhotos = [
        ...existingPhotos,
        {
          imageData: currentPhoto,
          timestamp: new Date()
        }
      ];

      const newPhotoCount = updatedPhotos.length;
      const isCompleted = newPhotoCount >= 3;

      // Update user document with the new photo array
      await updateDoc(doc(db, 'users', student.id), {
        photoCount: newPhotoCount,
        isCompleted,
        updatedAt: new Date(),
        photos: updatedPhotos
      });

      setPhotos(updatedPhotos.map(p => p.imageData));
      setCurrentPhoto(null);
      setShowConfirmation(false);

      if (isCompleted) {
        setShowThankYou(true);
      }

      setStudent(prev => prev ? {
        ...prev,
        photoCount: newPhotoCount,
        isCompleted,
        photos: updatedPhotos
      } : null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setPermissionError('Failed to upload photo. Please try again.');
    }
  };

  const handleRetake = () => {
    setCurrentPhoto(null);
    setShowConfirmation(false);
  };

  if (!student) {
    return null;
  }

  if (!isSubmissionOpen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[80vh] flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Submissions are currently closed</h2>
          <p className="text-gray-600">Please check back later when submissions reopen.</p>
        </div>
      </motion.div>
    );
  }

  if (showThankYou) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[80vh] flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
          <p className="text-gray-600">You've completed your photo submissions.</p>
          <p className="text-gray-600 mt-2">The yearbook will be available soon!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto py-8 px-4"
    >
      <h1 className="text-2xl font-bold text-center mb-8">Take Your Photos</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 text-center">
          {student.photoCount}/3 photos taken
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${(student.photoCount / 3) * 100}%` }}
          />
        </div>
      </div>

      {permissionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {permissionError}
        </div>
      )}

      <AnimatePresence mode="wait">
        {showConfirmation && currentPhoto ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-4"
          >
            <img
              src={currentPhoto}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="flex gap-4">
              <button
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-50"
              >
                <X size={20} />
                Retake
              </button>
              <button
                onClick={handleConfirmPhoto}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600"
              >
                <Check size={20} />
                Upload
              </button>
            </div>
          </motion.div>
        ) : (
          student.photoCount < 3 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 transition-colors mb-8"
            >
              <Camera className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm text-gray-600">Take Photo</span>
            </motion.button>
          )
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-40 object-cover rounded-lg"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UploadPage;