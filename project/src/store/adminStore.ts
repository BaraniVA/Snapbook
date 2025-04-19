import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminState {
  isSubmissionOpen: boolean;
  isYearbookGenerated: boolean;
  toggleSubmission: () => Promise<void>;
  generateYearbook: () => Promise<void>;
  resetYearbook: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  isSubmissionOpen: true,
  isYearbookGenerated: false,
  toggleSubmission: async () => {
    try {
      const settingsRef = doc(db, 'settings', 'app_config');
      const settingsDoc = await getDoc(settingsRef);
      const newState = !settingsDoc.data()?.acceptingSubmissions;
      
      await setDoc(settingsRef, {
        acceptingSubmissions: newState,
        closedAt: newState ? null : new Date().toISOString(),
      }, { merge: true });
      
      set({ isSubmissionOpen: newState });
    } catch (error) {
      console.error('Error toggling submission:', error);
    }
  },
  generateYearbook: async () => {
    try {
      const settingsRef = doc(db, 'settings', 'app_config');
      await setDoc(settingsRef, {
        yearbookGenerating: true,
        yearbookGeneratedAt: new Date().toISOString(),
      }, { merge: true });
      
      set({ isYearbookGenerated: true });
    } catch (error) {
      console.error('Error generating yearbook:', error);
    }
  },
  resetYearbook: async () => {
    try {
      const settingsRef = doc(db, 'settings', 'app_config');
      await setDoc(settingsRef, {
        yearbookGenerating: false,
        yearbookGeneratedAt: null,
      }, { merge: true });
      
      set({ isYearbookGenerated: false });
    } catch (error) {
      console.error('Error resetting yearbook:', error);
    }
  },
}));