import type { ServerFirebaseConfig } from '../lib/firebase';

export const SW_PATH = '/firebase-messaging-sw.js';

export const buildSwUrl = (cfg: ServerFirebaseConfig): string => {
  const { vapidKey: _vapidKey, ...firebaseOnly } = cfg;
  const params = new URLSearchParams({ firebaseConfig: JSON.stringify(firebaseOnly) });
  return `${SW_PATH}?${params.toString()}`;
};
