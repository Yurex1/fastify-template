import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';
import firebaseConfigs, { type ServerFirebaseConfig } from '../api/firebaseConfigs/firebase';

export type { ServerFirebaseConfig };

let configPromise: Promise<ServerFirebaseConfig> | null = null;
let messagingPromise: Promise<Messaging> | null = null;

export function getFirebaseConfig(): Promise<ServerFirebaseConfig> {
  if (!configPromise) {
    configPromise = (firebaseConfigs.getFirebaseConfig() as Promise<ServerFirebaseConfig>).catch((err) => {
      configPromise = null;
      throw err;
    });
  }
  return configPromise;
}

function getOrCreateApp(config: ServerFirebaseConfig): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(config);
}

export function getMessagingInstance(): Promise<Messaging> {
  if (!messagingPromise) {
    messagingPromise = getFirebaseConfig()
      .then((config) => getMessaging(getOrCreateApp(config)))
      .catch((err) => {
        messagingPromise = null;
        throw err;
      });
  }
  return messagingPromise;
}
