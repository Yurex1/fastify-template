import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { start } from '../src/main.js';

describe('Auth Tests', () => {
  let app;
  let testUserData;
  let authToken;
  let userId;

  before(async () => {
    app = await start();
    testUserData = {
      username: `testuser-${Math.floor(Math.random() * 10000)}`,
      email: `test-${Math.floor(Math.random() * 10000)}@example.com`,
      password: 'TestPassword123!',
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
      );

      assert(session, 'Should return session data');
      assert(session.accessToken, 'Should have access token');
      assert(session.refreshToken, 'Should have refresh token');

      authToken = session.accessToken;

      const user = await app.services.auth.verify(
        'access',
        `Bearer ${authToken}`,
      );
      userId = user.id;
    });
  });

  describe('Sign In Test', () => {
    test('should successfully sign in user', async () => {
      const session = await app.services.auth.signIn(
        testUserData.username,
        testUserData.password,
      );

      assert(session, 'Should return session data');
      assert(session.accessToken, 'Should have access token');
      assert(session.refreshToken, 'Should have refresh token');

      authToken = session.accessToken;
    });
  });

  describe('Refresh Token Test', () => {
    test('should successfully refresh access token', async () => {
      const session = await app.services.auth.refresh(userId);

      assert(session, 'Should return session data');
      assert(session.accessToken, 'Should have access token');
      assert(session.refreshToken, 'Should have refresh token');

      authToken = session.accessToken;
    });
  });

  describe('Change Password Test', () => {
    test('should successfully change password', async () => {
      const newPassword = 'NewPassword123!';

      const user = await app.services.auth.changePassword(
        userId,
        testUserData.password,
        newPassword,
      );

      assert(user, 'Should return user data');
      assert(user.id, 'Should have user ID');
      assert(
        user.username === testUserData.username,
        'Should have correct username',
      );

      testUserData.password = newPassword;
    });
  });

  describe('Sign Out Test', () => {
    test('should successfully sign out', async () => {
      const result = await app.services.auth.signOut(userId);

      assert(result, 'Should return result');
      assert(result.signedOut === true, 'Should return signedOut: true');
    });
  });
});
