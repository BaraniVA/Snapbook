import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Quote {
  text: string;
}

interface YearbookEntry {
  studentName: string;
  photo: string;
  quote: string;
}

const STORAGE_KEY = 'snapbook_yearbook_entries';

const YearbookPage = () => {
  const [showQR, setShowQR] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [entries, setEntries] = useState<YearbookEntry[]>([]);
  const currentUrl = window.location.href;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we already have stored entries
        const storedEntries = localStorage.getItem(STORAGE_KEY);
        
        if (storedEntries) {
          // Use the stored entries if available
          setEntries(JSON.parse(storedEntries));
          return;
        }
        
        // If no stored entries, generate new ones
        // First fetch quotes from quotes collection
        const quotesSnapshot = await getDocs(collection(db, 'quotes'));
        let quotes: Quote[] = [];
        
        if (!quotesSnapshot.empty) {
          quotes = quotesSnapshot.docs.map(doc => doc.data() as Quote);
        }
        
        // Default quotes in case the collection is empty or fetch fails
        const defaultQuotes = [
          { text: "Making memories that last forever" },
          { text: "Every picture tells a story" },
          { text: "Cherish the moments that matter most" },
          { text: "Life is made of small moments like these" }
        ];
        
        // Use quotes from database or fall back to defaults
        const availableQuotes = quotes.length > 0 ? quotes : defaultQuotes;
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const yearbookEntries = usersSnapshot.docs.map(doc => {
          const userData = doc.data();
          const photos = userData.photos || [];
          
          // Skip users without photos
          if (photos.length === 0) return null;
          
          // Consistently select photo based on first letter of name
          // This ensures the same photo is selected for the same user
          const photoIndex = userData.name?.charCodeAt(0) % photos.length || 0;
          const selectedPhoto = photos[photoIndex];
          
          // Select quote based on user's name length
          // This ensures the same quote is selected for the same user
          const quoteIndex = (userData.name?.length || 0) % availableQuotes.length;
          const selectedQuote = availableQuotes[quoteIndex];
          
          return {
            studentName: userData.name,
            photo: selectedPhoto?.imageData || '',
            quote: selectedQuote?.text || 'Making memories that last forever'
          };
        })
        .filter(entry => entry !== null) as YearbookEntry[]; // Only include entries with photos
        
        // Store the entries in localStorage for future visits
        localStorage.setItem(STORAGE_KEY, JSON.stringify(yearbookEntries));
        
        setEntries(yearbookEntries);
      } catch (error) {
        console.error('Error fetching yearbook data:', error);
      }
    };

    fetchData();
  }, []);

  const generatePDF = async () => {
    const yearbookElement = document.getElementById('yearbook');
    if (!yearbookElement) return;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1200, 800]
    });

    // Generate PDF for each page
    for (let i = 0; i < Math.ceil(entries.length / 2); i++) {
      if (i > 0) {
        pdf.addPage([1200, 800], 'landscape');
      }

      setCurrentPage(i);
      // Wait for page transition animation
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(yearbookElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, 1200, 800);
    }

    pdf.save('farewell-snapbook.pdf');
    setCurrentPage(0);
  };

  // Group entries into pairs for yearbook pages
  const pages = [];
  for (let i = 0; i < entries.length; i += 2) {
    pages.push(entries.slice(i, i + 2));
  }

  return (
    <div className="relative max-w-6xl mx-auto py-8 px-4" id="yearbook">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          className="p-2 rounded-full bg-white shadow-md"
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-6 h-6 text-purple-600" />
        </motion.button>
        
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-center">Class of 2024</h1>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQR(!showQR)}
              className="p-2 rounded-full bg-white shadow-md"
            >
              <Share2 className="w-6 h-6 text-purple-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={generatePDF}
              className="p-2 rounded-full bg-white shadow-md"
            >
              <Download className="w-6 h-6 text-purple-600" />
            </motion.button>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
          className="p-2 rounded-full bg-white shadow-md"
          disabled={currentPage === pages.length - 1}
        >
          <ChevronRight className="w-6 h-6 text-purple-600" />
        </motion.button>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-lg shadow-xl"
          >
            <h3 className="text-xl font-bold mb-4 text-center">Scan to View</h3>
            <QRCode value={currentUrl} className="mx-auto mb-4" />
            <button
              onClick={() => setShowQR(false)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Yearbook Pages */}
      {pages[currentPage] && (
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="flex">
            {/* Left Page */}
            <div className="w-1/2 p-8 border-r border-gray-200 relative">
              <div className="relative">
                <img
                  src={pages[currentPage][0]?.photo}
                  alt={pages[currentPage][0]?.studentName}
                  className="w-full h-64 object-cover rounded-lg mb-4 transform -rotate-3"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">{pages[currentPage][0]?.studentName}</h3>
              <p className="text-gray-600 italic text-lg">{pages[currentPage][0]?.quote}</p>
            </div>

            {/* Right Page */}
            {pages[currentPage][1] && (
              <div className="w-1/2 p-8 relative">
                <div className="absolute top-12 left-4 w-16 h-16 bg-blue-400 rounded-full" />
                <div className="relative">
                  <img
                    src={pages[currentPage][1]?.photo}
                    alt={pages[currentPage][1]?.studentName}
                    className="w-full h-64 object-cover rounded-lg mb-4 transform rotate-3"
                  />
                  <div className="absolute top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply opacity-50" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{pages[currentPage][1]?.studentName}</h3>
                <p className="text-gray-600 italic text-lg">{pages[currentPage][1]?.quote}</p>
                <div className="absolute bottom-16 right-8 w-24 h-4 bg-red-400 -rotate-12" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YearbookPage;

