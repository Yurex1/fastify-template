import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../../config';
import type { DeviceTokenService, Deps } from './types';

export const init = ({ deviceTokenRepo }: Deps): DeviceTokenService => ({
  register: async (userId, deviceId, token) => {
    await deviceTokenRepo.removeTokenForOtherOwners(token, userId, deviceId);
    return deviceTokenRepo.upsert({ userId, deviceId, token });
  },
  unregister: async (userId, deviceId) => {
    return deviceTokenRepo.removeByUserAndDevice(userId, deviceId);
  },

  getFirebaseConfigs: async () => {
    try {
      const document = await getFirestore().collection('settings').where('key', '==', 'firebaseConfigs').get();

      if (document.empty) {
        throw new Error('Firebase configs not found in database');
      }

      const value = document.docs[0].data().value;
      const parsed = JSON.parse(value);
      return { ...parsed, vapidKey: config.firebase.vapidKey };
    } catch (err) {
      console.error('Error in getFirebaseConfigs service:', err);
      throw err;
    }
  },
});
