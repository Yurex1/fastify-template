import admin from 'firebase-admin';
import { config } from '../../config';

export type NotificationService = FirebaseNotificationService;

class FirebaseNotificationService {
  private messaging: admin.messaging.Messaging | null;

  constructor() {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey,
        }),
      });

      this.messaging = admin.messaging();
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      this.messaging = null;
    }
  }

  async sendNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ invalidTokens: string[] }> {
    if (!this.messaging || tokens.length === 0) return { invalidTokens: [] };

    const response = await this.messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
    });

    const invalidTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code ?? '';
        const isInvalid =
          code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered';

        if (isInvalid) invalidTokens.push(tokens[idx]);
        else console.error(`FCM error for token ${tokens[idx]}:`, resp.error);
      }
    });

    return { invalidTokens };
  }

  async sendToUser(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ invalidTokens: string[] }> {
    return this.sendNotification(tokens, title, body, data);
  }

  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.messaging) return;

    try {
      await this.messaging.send({
        topic,
        notification: { title, body },
        data,
      });
    } catch (error) {
      console.error(`Error sending notification to topic ${topic}:`, error);
      throw new Error('Failed to send notification to topic');
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.messaging) return;

    try {
      await this.messaging.subscribeToTopic(tokens, topic);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw new Error('Failed to subscribe to topic');
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.messaging) return;

    try {
      await this.messaging.unsubscribeFromTopic(tokens, topic);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw new Error('Failed to unsubscribe from topic');
    }
  }
}

export const init = () => {
  return new FirebaseNotificationService();
};
