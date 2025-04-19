import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import YearbookPage from './pages/YearbookPage';
import SlideshowPage from './pages/SlideshowPage';
import InstallPage from './pages/InstallPage';
import AdminPage from './pages/AdminPage';
import PhotoWallPage from './pages/PhotoWallPage';
import { useAdminStore } from './store/adminStore';

function App() {
  const { isYearbookGenerated } = useAdminStore();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route 
            path="/yearbook" 
            element={isYearbookGenerated ? <YearbookPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/slideshow" 
            element={isYearbookGenerated ? <SlideshowPage /> : <Navigate to="/" />} 
          />
          <Route path="/photowall" element={<PhotoWallPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;