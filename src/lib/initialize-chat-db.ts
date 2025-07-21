import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';

/**
 * Initialize the chat database structure in Firestore
 * This ensures the chatSessions collection exists
 */
export const initializeChatDb = async () => {
  try {
    // Get the Firebase app instance
    const app = getApps().length > 0 ? getApp() : initializeApp({
      apiKey: "AIzaSyCKv_Rs6MNXV1cshKhf7T4C93RG82u11LA",
      authDomain: "b2bshowcase-199a8.firebaseapp.com",
      projectId: "b2bshowcase-199a8",
      storageBucket: "b2bshowcase-199a8.appspot.com",
      messagingSenderId: "608819928179",
      appId: "1:608819928179:web:774b8f3e120a927f279e06",
      measurementId: "G-8VTK238F1Y"
    });
    
    const db = getFirestore(app);
    
    // Check if chatSessions collection exists by attempting to query it
    const chatSessionsRef = collection(db, 'chatSessions');
    const testQuery = query(chatSessionsRef, limit(1));
    await getDocs(testQuery);
    
    console.log('Chat database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing chat database:', error);
    return false;
  }
};
