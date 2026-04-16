import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { start } from '../src/main.js';

describe('Chat & Message Tests', () => {
  let app;
  let user1, user2;
  let chat;
  let message;

  before(async () => {
    app = await start();

    const deviceId = 'test-device-123';
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const session1 = await app.services.auth.signUp(
      `user1-${suffix}@test.com`,
      `user1-${suffix}`,
      'password123',
      deviceId,
    );
    const session2 = await app.services.auth.signUp(
      `user2-${suffix}@test.com`,
      `user2-${suffix}`,
      'password123',
      deviceId,
    );

    user1 = await app.services.auth.verify('access', session1.accessToken);
    user2 = await app.services.auth.verify('access', session2.accessToken);
  });

  after(async () => {
    await app.cleanup();
  });

  describe('Chat Creation', () => {
    test('should successfully create a direct chat between two users', async () => {
      chat = await app.services.chat.create(user1.id, user2.id);

      assert(chat, 'Chat should be created');
      assert(chat.id, 'Chat should have an ID');
    });

    test('should return existing chat if already created (no duplicates)', async () => {
      const secondAttempt = await app.services.chat.create(user1.id, user2.id);

      assert.strictEqual(secondAttempt.id, chat.id, 'Should return the same chat ID');
    });

    test('should fail when creating chat with yourself', async () => {
      await assert.rejects(
        async () => await app.services.chat.create(user1.id, user1.id),
        (err) => err.statusCode === 400 || err.message.includes('yourself'),
      );
    });
  });

  describe('Messaging', () => {
    test('should successfully send a message', async () => {
      const text = 'Hello, this is a test message!';
      message = await app.services.chat.sendMessage(user1.id, chat.id, text);

      assert.strictEqual(message.text, text);
      assert.strictEqual(message.chatId, chat.id);
      assert.strictEqual(message.userId, user1.id);
    });

    test('should get messages for a specific chat', async () => {
      const messages = await app.services.chat.getMessagesByChatId(user1.id, chat.id);

      assert(Array.isArray(messages), 'Should return an array');
      assert(messages.length > 0, 'Should contain at least one message');
      assert.strictEqual(messages[0].text, message.text);
    });

    test('should fail to send message if user is not a member', async () => {
      const strangerId = 99999;
      await assert.rejects(
        async () => await app.services.chat.sendMessage(strangerId, chat.id, 'Illegal message'),
        (err) => err.statusCode === 403,
      );
    });
  });

  describe('Chat List', () => {
    test('should return list of chats for user', async () => {
      const chats = await app.services.chat.list(user1.id, 'approved', 1, 10);

      assert(Array.isArray(chats));
      assert(
        chats.some((c) => c.id === chat.id),
        'Created chat should be in the list',
      );
    });
  });

  describe('Message Updates & Deletion', () => {
    test('should successfully update a message', async () => {
      assert(message && message.id, 'Message should exist from previous tests');

      const newText = 'Updated text';
      const updated = await app.services.chat.updateMessage(message.id, { text: newText });

      assert.strictEqual(updated.text, newText);
    });
  });
});
