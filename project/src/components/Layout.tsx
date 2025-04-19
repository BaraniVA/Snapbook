import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Camera, PlayCircle, Home, Image } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-8 pb-24">{children}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center">
            <Link
              to="/"
              className={`flex flex-col items-center ${
                location.pathname === '/' ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/upload"
              className={`flex flex-col items-center ${
                location.pathname === '/upload' ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              <Camera size={24} />
              <span className="text-xs mt-1">Upload</span>
            </Link>
            <Link
              to="/photowall"
              className={`flex flex-col items-center ${
                location.pathname === '/photowall' ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              <Image size={24} />
              <span className="text-xs mt-1">Photos</span>
            </Link>
            <Link
              to="/yearbook"
              className={`flex flex-col items-center ${
                location.pathname === '/yearbook' ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              <Book size={24} />
              <span className="text-xs mt-1">Yearbook</span>
            </Link>
            <Link
              to="/slideshow"
              className={`flex flex-col items-center ${
                location.pathname === '/slideshow' ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              <PlayCircle size={24} />
              <span className="text-xs mt-1">Slideshow</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;