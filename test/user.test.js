import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { start } from '../src/main.js';

describe('User Tests', () => {
  let app;
  let testUserData;
  let authToken;
  let userId;

  before(async () => {
    app = await start();
    testUserData = {
      username: `testuser-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      email: `test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
      password: 'TestPassword123!',
    };

    const session = await app.services.auth.signUp(testUserData.email, testUserData.username, testUserData.password);

    authToken = session.accessToken;
    const user = await app.services.auth.verify('access', `Bearer ${authToken}`);
    userId = user.id;
  });

  after(async () => {
    await app.cleanup();
  });

  describe('Find All Users Test', () => {
    test('should find all users', async () => {
      const users = await app.services.user.findAll();

      assert(Array.isArray(users), 'Should return array of users');
      assert(users.length > 0, 'Should have at least one user');

      const foundUser = users.find((u) => u.id === userId);
      assert(foundUser, 'Should find our created user in the list');
      assert(foundUser.username === testUserData.username, 'Should have correct username');
      assert(foundUser.email === testUserData.email, 'Should have correct email');
    });
  });

  describe('Find One User Test', () => {
    test('should find user by ID', async () => {
      const user = await app.services.user.findOne({ id: userId });

      assert(user, 'Should find the user');
      assert(user.id === userId, 'Should have correct user ID');
      assert(user.username === testUserData.username, 'Should have correct username');
      assert(user.email === testUserData.email, 'Should have correct email');
    });

    test('should find user by email', async () => {
      const user = await app.services.user.findOne({
        email: testUserData.email,
      });

      assert(user, 'Should find the user');
      assert(user.id === userId, 'Should have correct user ID');
      assert(user.username === testUserData.username, 'Should have correct username');
      assert(user.email === testUserData.email, 'Should have correct email');
    });

    test('should throw error for non-existent user', async () => {
      try {
        await app.services.user.findOne({ id: 99999 });
        assert.fail('Should have thrown an error for non-existent user');
      } catch (error) {
        assert(
          error.message.includes('USER_NOT_FOUND') || error.statusCode === 404,
          'Should throw USER_NOT_FOUND error',
        );
      }
    });
  });

  describe('Update Email Test', () => {
    test('should update user email', async () => {
      const newEmail = `updated-${Date.now()}@example.com`;

      const updatedUser = await app.services.user.updateEmail(userId, newEmail);

      assert(updatedUser, 'Should return updated user');
      assert(updatedUser.id === userId, 'Should have correct user ID');
      assert(updatedUser.email === newEmail, 'Should have updated email');
      assert(updatedUser.username === testUserData.username, 'Should keep same username');

      testUserData.email = newEmail;
    });

    test('should return null for non-existent user email update', async () => {
      const newEmail = `test-${Date.now()}@example.com`;

      const result = await app.services.user.updateEmail(99999, newEmail);
      assert.strictEqual(result, null, 'Should return null for non-existent user');
    });
  });

  describe('Update User Test', () => {
    test('should update user data', async () => {
      const updateData = {
        username: `updated-${Date.now()}`,
        email: `updated-${Date.now()}@example.com`,
      };

      const updatedUser = await app.services.user.update(userId, updateData);

      assert(updatedUser, 'Should return updated user');
      assert(updatedUser.id === userId, 'Should have correct user ID');
      assert(updatedUser.username === updateData.username, 'Should have updated username');
      assert(updatedUser.email === updateData.email, 'Should have updated email');

      testUserData.username = updateData.username;
      testUserData.email = updateData.email;
    });

    test('should update partial user data', async () => {
      const newUsername = `partial-${Date.now()}`;
      const updateData = { username: newUsername };

      const updatedUser = await app.services.user.update(userId, updateData);

      assert(updatedUser, 'Should return updated user');
      assert(updatedUser.id === userId, 'Should have correct user ID');
      assert(updatedUser.username === newUsername, 'Should have updated username');
      assert(updatedUser.email === testUserData.email, 'Should keep same email');

      testUserData.username = newUsername;
    });

    test('should return null for non-existent user update', async () => {
      const updateData = { username: 'test' };

      const result = await app.services.user.update(99999, updateData);
      assert.strictEqual(result, null, 'Should return null for non-existent user');
    });
  });

  describe('Remove User Test', () => {
    test('should remove user', async () => {
      const result = await app.services.user.remove(userId);

      assert(result, 'Should return result');
      assert(result.removed === true, 'Should return removed: true');
    });

    test('should confirm user is removed', async () => {
      try {
        await app.services.user.findOne({ id: userId });
        assert.fail('Should have thrown an error for removed user');
      } catch (error) {
        assert(
          error.message.includes('USER_NOT_FOUND') || error.statusCode === 404,
          'Should throw USER_NOT_FOUND error for removed user',
        );
      }
    });

    test('should throw error for non-existent user removal', async () => {
      try {
        await app.services.user.remove(99999);
        assert.fail('Should have thrown an error for non-existent user');
      } catch (error) {
        assert(
          error.message.includes('USER_NOT_FOUND') || error.statusCode === 404,
          'Should throw USER_NOT_FOUND error',
        );
      }
    });
  });

  describe('User Repository Direct Access Test', () => {
    test('should access user repository directly', async () => {
      const repoUserData = {
        username: `repo-user-${Date.now()}`,
        email: `repo-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      };

      const createdRepoUser = await app.repos.user.create(repoUserData);

      assert(createdRepoUser, 'Should return created user');
      assert(createdRepoUser.id, 'Should have ID');
      assert(createdRepoUser.username === repoUserData.username, 'Should have correct username');
      assert(createdRepoUser.email === repoUserData.email, 'Should have correct email');

      const allUsers = await app.repos.user.findAll();
      assert(Array.isArray(allUsers), 'Should return array of users');
      assert(allUsers.length > 0, 'Should have users');

      const foundRepoUser = await app.repos.user.findOne({
        id: createdRepoUser.id,
      });
      assert(foundRepoUser, 'Should find the user');
      assert(foundRepoUser.id === createdRepoUser.id, 'Should have correct ID');

      await app.repos.user.remove(createdRepoUser.id);
    });
  });
});
