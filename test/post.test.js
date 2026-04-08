import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { start } from '../src/main.js';

describe('Post Integration Tests', () => {
  let app;
  let authToken;
  let userId;
  let createdPostId;
  let testUserData;

  before(async () => {
    app = await start();
    testUserData = {
      username: `testuser--${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      email: `test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
      password: 'TestPassword123!',
      deviceId: `test-device-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };

    const session = await app.services.auth.signUp(
      testUserData.email,
      testUserData.username,
      testUserData.password,
      testUserData.deviceId,
    );
    authToken = session.accessToken;
    const user = await app.services.auth.verify('access', authToken);
    userId = user.id;
  });

  after(async () => {
    await app.cleanup();
  });

  describe('Post CRUD', () => {
    test('should create a new post via service', async () => {
      const postData = {
        title: 'Integration Test Post',
        body: 'Content of the post',
        category: 'Testing',
        photo: 'image.jpg',
        userId: userId,
      };

      const post = await app.services.post.create(postData);

      assert.ok(post.id, 'Post should have an ID');
      assert.strictEqual(post.title, postData.title);
      assert.strictEqual(post.userId, userId);
      createdPostId = post.id;
    });

    test('should find all posts', async () => {
      const posts = await app.services.post.findAll();
      assert(Array.isArray(posts));
      assert(posts.length > 0);
    });
    test('should update a post via service', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedPost = await app.services.post.update(createdPostId, updateData);

      assert.strictEqual(updatedPost.id, createdPostId);
      assert.strictEqual(updatedPost.title, updateData.title);
    });

    test('should remove a post via service', async () => {
      const result = await app.services.post.remove(createdPostId);
      assert.strictEqual(result.removed, true);

      try {
        await app.services.post.findById(createdPostId);
        assert.fail('Should have thrown POST_NOT_FOUND error');
      } catch (error) {
        assert.strictEqual(error.statusCode, 404);
        assert(error.message.includes('POST_NOT_FOUND'));
      }
    });
  });
});
