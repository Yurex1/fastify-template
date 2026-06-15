import admin from 'firebase-admin';
import serviceAccount from '../../keys/fastify-template-ae163-firebase-adminsdk-fbsvc-d808ab511a.json';

export type NotificationService = FirebaseNotificationService;

class FirebaseNotificationService {
  private messaging: admin.messaging.Messaging | null;

  constructor() {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
      });

      this.messaging = admin.messaging();
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      this.messaging = null;
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
  async sendToUser(
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
    console.log('Successfully sent:', response);

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
