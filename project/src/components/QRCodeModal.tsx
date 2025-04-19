import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import QRCode from 'react-qr-code';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const appUrl = window.location.origin;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Join Farewell Snapbook</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <QRCode
            value={appUrl}
            className="w-full h-auto max-w-[200px] mx-auto mb-4"
          />
          <p className="text-center text-sm text-purple-700">
            Scan this QR code to open the app and start contributing your photos
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">1</div>
            <p>Scan the QR code with your phone's camera</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">2</div>
            <p>Add the app to your home screen when prompted</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">3</div>
            <p>Upload up to 5 photos to the shared album</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRCodeModal;