import { FirebaseError, initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { firebaseConfig } from './firebaseConfig';
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e: unknown) {
  if (e instanceof FirebaseError && e.code !== 'app/duplicate-app') {
    console.error(e);
  }
  app = initializeApp(firebaseConfig, 'DEFAULT');
}

export const messaging = getMessaging(app);
