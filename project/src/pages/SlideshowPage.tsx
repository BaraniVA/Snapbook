import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Quote {
  text: string;
}

interface Photo {
  imageData: string;
  timestamp: Date;
}

interface User {
  name: string;
  photos: Photo[];
}

const SlideshowPage = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Array<{
    image: string;
    name: string;
    quote: string;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quotes
        const quotesSnap = await getDocs(collection(db, 'quotes'));
        const quotes = quotesSnap.docs.map(doc => doc.data() as Quote);

        // Fetch users with photos
        const usersSnap = await getDocs(collection(db, 'users'));
        const userPhotos = usersSnap.docs
          .map(doc => {
            const userData = doc.data() as User;
            return (userData.photos || []).map(photo => ({
              image: photo.imageData,
              name: userData.name,
              quote: quotes[Math.floor(Math.random() * quotes.length)]?.text || "Making memories that last forever"
            }));
          })
          .flat();

        setSlides(userPhotos);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && slides.length > 0) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full max-w-4xl mx-auto p-4">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].name}
              className="w-full h-[70vh] object-cover rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
              <h2 className="text-white text-2xl font-bold mb-2">
                {slides[currentSlide].name}
              </h2>
              <p className="text-white italic">
                {slides[currentSlide].quote}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute bottom-8 right-8 p-4 bg-white rounded-full shadow-lg z-10"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-purple-600" />
        ) : (
          <Play className="w-6 h-6 text-purple-600" />
        )}
      </button>
    </div>
  );
};

export default SlideshowPage;