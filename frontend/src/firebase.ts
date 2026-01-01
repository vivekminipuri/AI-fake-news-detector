import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBFXxDqcABmRJYypSYINaygpxb2gQVDKLQ",
    authDomain: "ai-fake-news-detector-79bfe.firebaseapp.com",
    projectId: "ai-fake-news-detector-79bfe",
    storageBucket: "ai-fake-news-detector-79bfe.firebasestorage.app",
    messagingSenderId: "644548607516",
    appId: "1:644548607516:web:def5e2cc5ae80942ab29d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
