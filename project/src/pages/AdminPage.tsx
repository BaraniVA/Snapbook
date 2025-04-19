import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, BookOpen, Users, Camera, AlertTriangle, UserX } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const AdminPage = () => {
  const { isSubmissionOpen, isYearbookGenerated, toggleSubmission, generateYearbook } = useAdminStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPhotos: 0,
    completedSubmissions: 0,
  });
  const [users, setUsers] = useState<Array<{
    id: string;
    name: string;
    photoCount: number;
    isCompleted: boolean;
    createdAt: Date;
  }>>([]);

  useEffect(() => {
    // Real-time listener for users collection
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      setUsers(usersData);
      setStats(prev => ({
        ...prev,
        totalUsers: snapshot.size,
        completedSubmissions: usersData.filter(user => user.isCompleted).length,
      }));
    });

    return () => unsubscribe();
  }, []);

  const handleKickUser = async (userId: string) => {
    try {
      // Delete user
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error kicking user:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-8 px-4"
    >
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Total Users</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Total Photos</h3>
          </div>
          <p className="text-3xl font-bold">{users.reduce((total, user) => total + user.photoCount, 0)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Completed</h3>
          </div>
          <p className="text-3xl font-bold">{stats.completedSubmissions}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-center py-2">Photos</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-center py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2">{user.name}</td>
                    <td className="text-center">{user.photoCount}/3</td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        user.isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {user.isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleKickUser(user.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove User"
                      >
                        <UserX size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Submission Control</h2>
          <button
            onClick={toggleSubmission}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              isSubmissionOpen
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            {isSubmissionOpen ? (
              <>
                <Lock className="w-4 h-4" />
                Close Submissions
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Reopen Submissions
              </>
            )}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Yearbook Control</h2>
          <button
            onClick={generateYearbook}
            disabled={isYearbookGenerated}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              isYearbookGenerated
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {isYearbookGenerated ? 'Yearbook Generated' : 'Generate Yearbook'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;