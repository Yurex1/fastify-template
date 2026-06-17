import { FirebaseError, initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';
import firebaseConfigs, { type ServerFirebaseConfig } from '../api/firebaseConfigs/firebase';

export type { ServerFirebaseConfig };

let app: FirebaseApp;
let messagingInstance: Messaging;
let initPromise: Promise<Messaging> | null = null;
let configPromise: Promise<ServerFirebaseConfig> | null = null;

function fetchConfig(): Promise<ServerFirebaseConfig> {
  if (!configPromise) {
    configPromise = firebaseConfigs.getFirebaseConfig() as Promise<ServerFirebaseConfig>;
  }
  return configPromise;
}

async function initFirebase(): Promise<Messaging> {
  const firebaseConfig = await fetchConfig();

  try {
    app = initializeApp(firebaseConfig);
  } catch (e: unknown) {
    if (e instanceof FirebaseError && e.code !== 'app/duplicate-app') {
      console.error(e);
    }
    app = initializeApp(firebaseConfig, 'DEFAULT');
  }

  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export function getMessagingInstance(): Promise<Messaging> {
  if (!initPromise) {
    initPromise = initFirebase();
  }
  return initPromise;
}

export function getFirebaseConfig(): Promise<ServerFirebaseConfig> {
  return fetchConfig();
}
