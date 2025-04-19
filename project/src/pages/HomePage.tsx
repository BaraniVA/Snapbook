import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, QrCode } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const HomePage = () => {
  const navigate = useNavigate();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true);
  
  useEffect(() => {
    const fetchSubmissionStatus = async () => {
      const settingsDoc = await getDoc(doc(db, 'settings', 'app_config'));
      if (settingsDoc.exists()) {
        setIsSubmissionOpen(settingsDoc.data()?.acceptingSubmissions ?? false);
      }
    };
    fetchSubmissionStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!isSubmissionOpen) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    try {
      // Create new user in Firestore
      const userRef = await addDoc(collection(db, 'users'), {
        name: name.trim(),
        photoCount: 0,
        isCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        photos: []
      });

      // Store user ID in localStorage
      localStorage.setItem('studentId', userRef.id);
      localStorage.setItem('studentName', name.trim());

      // Navigate to upload page
      navigate('/upload');
    } catch (err) {
      setError('Failed to register. Please try again.');
      console.error('Error registering user:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-4 rounded-full bg-purple-100"
      >
        <Camera size={48} className="text-purple-600" />
      </motion.div>
      
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Farewell Snapbook
      </h1>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Capture and share your precious college memories in our digital yearbook
      </p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-6">
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
        
        <div className="flex gap-4 mb-8">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            className={`flex-1 bg-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-purple-700 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Registering...' : 'Get Started'}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold shadow-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2"
            onClick={() => setIsQRModalOpen(true)}
          >
            <QrCode size={20} />
            Share App
          </motion.button>
        </div>
      </form>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-gray-500"
      >
        <p>Add to homescreen for the best experience</p>
        <button 
          onClick={() => navigate('/install')}
          className="text-purple-600 underline mt-1"
        >
          Learn how
        </button>
      </motion.div>

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </motion.div>
  );
};

export default HomePage;