import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { start } from '../src/main.js';

describe('Auth Tests', () => {
  let app;
  let testUserData;
  let refreshToken;
  let accessToken;
  let userId;

  before(async () => {
    app = await start();
    testUserData = {
      username: `testuser-${Math.floor(Math.random() * 10000)}`,
      email: `test-${Math.floor(Math.random() * 10000)}@example.com`,
      password: 'TestPassword123!',
      deviceId: `test-device-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };
  });

  after(async () => {
    await app.cleanup();
  });

  describe('Sign Up Test', () => {
    test('should successfully create user', async () => {
      const session = await app.services.auth.signUp(
        testUserData.email,
        testUserData.username,
        testUserData.password,
        testUserData.deviceId,
      );

      assert(session, 'Should return session data');
      assert(session.accessToken, 'Should have access token');
      assert(session.refreshToken, 'Should have refresh token');

      accessToken = session.accessToken;
      refreshToken = session.refreshToken;

      const user = await app.services.auth.verify('common', `Bearer ${accessToken}`);
      userId = user.id;
    });
  });

  describe('Sign In Test', () => {
    test('should successfully sign in user', async () => {
      const session = await app.services.auth.signIn(
        testUserData.username,
        testUserData.password,
        testUserData.deviceId,
      );

      assert(session, 'Should return session data');
      assert(session.accessToken, 'Should have access token');
      assert(session.refreshToken, 'Should have refresh token');

      accessToken = session.accessToken;
      refreshToken = session.refreshToken;
    });
  });

  describe('Refresh Token Test', () => {
    test('should successfully refresh access token', async () => {
      const oldRefreshToken = refreshToken;
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const session = await app.services.auth.refresh(userId, testUserData.deviceId, oldRefreshToken);

      assert.notStrictEqual(session.refreshToken, oldRefreshToken, 'Refresh token MUST change after use');

      await assert.rejects(
        async () => {
          await app.services.auth.refresh(userId, testUserData.deviceId, oldRefreshToken);
        },
        (err) => err.statusCode === 401 || err.message?.includes('INVALID_REFRESH_TOKEN'),
        'Should not allow using the same refresh token twice',
      );
      refreshToken = session.refreshToken;
    });
  });

  describe('Change Password Test', () => {
    test('should successfully change password', async () => {
      const newPassword = 'NewPassword123!';

      const user = await app.services.auth.changePassword(userId, testUserData.password, newPassword);

      assert(user, 'Should return user data');
      assert(user.id, 'Should have user ID');
      assert(user.username === testUserData.username, 'Should have correct username');

      testUserData.password = newPassword;
    });
  });

  describe('Sign Out Test', () => {
    test('should successfully sign out', async () => {
      await app.services.auth.signOut(userId, testUserData.deviceId);

      await assert.rejects(async () => {
        await app.services.auth.refresh(testUserData.deviceId, refreshToken);
      }, 'Refresh must fail after user signed out');
    });
  });
});
