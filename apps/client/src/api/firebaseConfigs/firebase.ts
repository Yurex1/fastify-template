import type { FirebaseOptions } from 'firebase/app';
import api from '../api';

export interface ServerFirebaseConfig extends FirebaseOptions {
  vapidKey: string;
}

const firebaseConfigs = {
  getFirebaseConfig: async () => {
    const response = await api.get('/deviceToken/firebase-configs').json<ServerFirebaseConfig>();
    return response;
  },
};

export default firebaseConfigs;
