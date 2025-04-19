import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Photo {
  imageData: string;
  timestamp: Date;
}

interface User {
  id: string;
  name: string;
  photos: Photo[];
}

const PhotoWallPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          photos: doc.data().photos || []
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handleDownload = (imageData: string, userName: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${userName}_photo_${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl text-gray-600">Loading photos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Photo Wall</h1>
      
      {users.map((user) => (
        <div key={user.id} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{user.name}'s Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <img
                  src={photo.imageData}
                  alt={`${user.name}'s photo ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                <button
                  onClick={() => handleDownload(photo.imageData, user.name, index)}
                  className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="w-5 h-5 text-purple-600" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      
      {users.length === 0 && (
        <div className="text-center text-gray-600 py-12">
          <p>No photos have been uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default PhotoWallPage;