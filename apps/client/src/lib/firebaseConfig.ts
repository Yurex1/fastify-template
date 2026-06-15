import { env } from '../utils/requireEnv';

export const firebaseConfig = {
  apiKey: env.requireEnv('VITE_FIREBASE_API_KEY'),
  authDomain: env.requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env.requireEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env.requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env.requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env.requireEnv('VITE_FIREBASE_APP_ID'),
  measurementId: env.requireEnv('VITE_FIREBASE_MEASUREMENT_ID'),
};
