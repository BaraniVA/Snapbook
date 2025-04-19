import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Plus, Menu } from 'lucide-react';

const InstallPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto py-8 px-4"
    >
      <h1 className="text-2xl font-bold text-center mb-8">
        Install Farewell Snapbook
      </h1>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-purple-600" />
            iOS Installation
          </h2>
          <ol className="space-y-4 text-gray-600">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              Open Safari and tap the Share button
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              Scroll down and tap "Add to Home Screen"
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              Tap "Add" to confirm
            </li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Menu className="w-5 h-5 mr-2 text-purple-600" />
            Android Installation
          </h2>
          <ol className="space-y-4 text-gray-600">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              Tap the menu icon in Chrome
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              Select "Install app" or "Add to Home screen"
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              Follow the prompts to install
            </li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-purple-600" />
            Desktop Installation
          </h2>
          <ol className="space-y-4 text-gray-600">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              Click the install icon in your browser's address bar
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              Click "Install" in the prompt
            </li>
          </ol>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center"
      >
        <Download className="w-5 h-5 mr-2" />
        Install Now
      </motion.button>
    </motion.div>
  );
};

export default InstallPage;