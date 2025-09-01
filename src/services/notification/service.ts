import admin from 'firebase-admin';
import { config } from '../../config';

export type NotificationService = FirebaseNotificationService;

class FirebaseNotificationService {
  private messaging: admin.messaging.Messaging | null;

  constructor() {
    if (!admin.apps.length && config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
      try {
        console.log('🚀 Initializing Firebase Admin SDK...');
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'),
            clientEmail: config.firebase.clientEmail,
          }),
        });
        this.messaging = admin.messaging();
        console.log('✅ Firebase Admin SDK initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        this.messaging = null;
      }
    } else if (!admin.apps.length) {
      this.messaging = null;
    } else {
      console.log('✅ Using existing Firebase app');
      this.messaging = admin.messaging();
    }
  }

  async sendNotification(token: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    if (!this.messaging) {
      console.warn('Firebase not initialized. Notification not sent.');
      return;
    }

    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data,
        token,
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent notification:', response);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error(`Failed to send notification: ${error}`);
    }
  }

  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.messaging) {
      console.warn('Firebase not initialized. Topic notification not sent.');
      return;
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data,
        android: {
          notification: {
            sound: 'default',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.send(message);

      console.log('Successfully sent topic notification:', response);
    } catch (error) {
      throw new Error(`Failed to send topic notification: ${error}`);
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.messaging) {
      console.warn('Firebase not initialized. Topic subscription not performed.');
      return;
    }

    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      console.log('Successfully subscribed to topic:', response);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw new Error(`Failed to subscribe to topic: ${error}`);
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.messaging) {
      console.warn('Firebase not initialized. Topic unsubscription not performed.');
      return;
    }

    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw new Error(`Failed to unsubscribe from topic: ${error}`);
    }
  }
}

export const init = () => {
  return new FirebaseNotificationService();
};
