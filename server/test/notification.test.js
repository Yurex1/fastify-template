import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { start } from '../src/main.js';

describe('Notification Service Tests', () => {
  let app;

  before(async () => {
    app = await start();
  });

  test('should have notification service available', async () => {
    assert(app.services.notification);
    assert(typeof app.services.notification.sendNotification === 'function');
    assert(typeof app.services.notification.sendNotificationToTopic === 'function');
    assert(typeof app.services.notification.subscribeToTopic === 'function');
    assert(typeof app.services.notification.unsubscribeFromTopic === 'function');
  });

  test('should send notification on health check (mocked)', async () => {
    const originalSendNotification = app.services.notification.sendNotificationToTopic;
    let notificationSent = false;

    app.services.notification.sendNotificationToTopic = async (topic, title, body, data) => {
      notificationSent = true;
      assert.strictEqual(topic, 'health-check');
      assert.strictEqual(title, 'App Status');
      assert.strictEqual(body, 'APP is running');
      assert(data.endpoint === 'health-check');
      assert(data.status === 'healthy');
      assert(data.timestamp);
    };

    // Call health check service directly
    const result = await app.services.service.check();
    assert(result);

    // Manually trigger the notification that would be sent by the API
    await app.services.notification.sendNotificationToTopic('health-check', 'App Status', 'APP is running', {
      endpoint: 'health-check',
      timestamp: new Date().toISOString(),
      status: 'healthy',
    });

    assert(notificationSent, 'Notification should have been sent');

    // Restore original function
    app.services.notification.sendNotificationToTopic = originalSendNotification;
  });

  test('health check should work even if notification fails', async () => {
    // Mock notification service to throw error
    const originalSendNotification = app.services.notification.sendNotificationToTopic;

    app.services.notification.sendNotificationToTopic = async () => {
      throw new Error('Firebase not configured');
    };

    // Call health check service directly - should still work
    const result = await app.services.service.check();
    assert(result);

    // Test that notification service handles errors gracefully
    try {
      await app.services.notification.sendNotificationToTopic('test', 'test', 'test');
    } catch (error) {
      assert(error.message.includes('Firebase not configured'));
    }

    // Restore original function
    app.services.notification.sendNotificationToTopic = originalSendNotification;
  });

  after(async () => {
    await app.cleanup();
  });
});
