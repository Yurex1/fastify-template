import { exception } from '../../utils/exception/util';
import { validatePassword } from '../../utils/password/util';
import { passwords } from '../../utils/passwords/util';
import { sessions } from '../../utils/sessions/utils';
import type { AuthService, Deps } from './types';

export const init = ({ userRepo, sessionRepo }: Deps): AuthService => ({
  signIn: async (usernameOrEmail, password, deviceId) => {
    const user = await userRepo.findOneByUsernameOrEmail(usernameOrEmail, true);
    if (!user) {
      throw exception.badRequest('No account found with this username or email');
    }

    if (!user.password) {
      throw exception.badRequest('Invalid credentials');
    }

    const validPassword = passwords.compare(password, user.password);
    if (!validPassword) {
      throw exception.badRequest('Incorrect password');
    }

    const session = sessions.generate(user);
    const hashedToken = passwords.hash(session.refreshToken);

    await sessionRepo.upsert({
      userId: user.id,
      deviceId,
      refreshToken: hashedToken,
      expiresAt: session.expiresAt,
    });

    return session;
  },

  signUp: async (email, username, password, deviceId) => {
    const existingUser = await userRepo.exists({ email });
    if (existingUser) {
      throw exception.badRequest('This email is already registered');
    }

    const existingUsername = await userRepo.exists({ username });
    if (existingUsername) {
      throw exception.badRequest('This username is already taken');
    }
    validatePassword(password, email, username);
    const hashedPassword = passwords.hash(password);

    const user = await userRepo.create({
      email,
      username,
      password: hashedPassword,
    });

    const session = sessions.generate(user);
    const hashedToken = passwords.hash(session.refreshToken);

    await sessionRepo.upsert({
      userId: user.id,
      deviceId,
      refreshToken: hashedToken,
      expiresAt: session.expiresAt,
    });

    return session;
  },

  signOut: async (userId, deviceId) => {
    await sessionRepo.removeByUserIdAndDeviceId(userId, deviceId);
    return { signedOut: true };
  },

  verify: async (access, token) => {
    try {
      if (!token) throw exception.unauthorized('NO_TOKEN_PROVIDED');

      const payload = sessions.validate(access, token);
      if (!payload.id) throw exception.unauthorized('INVALID_TOKEN_PAYLOAD');

      const user = await userRepo.findOne({ id: payload.id });
      if (!user) throw exception.notFound('No account found with this username or email');

      return user;
    } catch (err) {
      if (exception.isCustomException(err)) throw err;
      throw exception.unauthorized();
    }
  },

  refresh: async (userId, deviceId, refreshToken) => {
    const payload = sessions.validate('refresh', refreshToken);
    const user = await userRepo.findOne({ id: userId });
    if (payload.id !== user.id) throw exception.unauthorized('TOKEN_USER_MISMATCH');
    const sessionData = await sessionRepo.findOne({ userId, deviceId });

    if (!sessionData) {
      throw exception.unauthorized('SESSION_EXPIRED_OR_INVALID');
    }

    if (!user) {
      throw exception.notFound('No account found with this username or email');
    }

    if (new Date() > sessionData.expiresAt) {
      await sessionRepo.removeByUserIdAndDeviceId(userId, deviceId);
      throw exception.unauthorized('REFRESH_TOKEN_EXPIRED');
    }
    const isValid = passwords.compare(refreshToken, sessionData.refreshToken);
    if (!isValid) {
      await sessionRepo.removeByUserIdAndDeviceId(userId, deviceId);
      throw exception.unauthorized('INVALID_REFRESH_TOKEN');
    }

    const session = sessions.generate(user);

    const hashedToken = passwords.hash(session.refreshToken);

    await sessionRepo.upsert({
      userId: user.id,
      deviceId,
      refreshToken: hashedToken,
      expiresAt: session.expiresAt,
    });
    return session;
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    const user = await userRepo.findOne({ id: userId }, true);
    if (!user) {
      throw exception.notFound('No account found with this username or email');
    }

    if (!user.password) {
      throw exception.badRequest('Incorrect password');
    }

    const validPassword = passwords.compare(oldPassword, user.password);
    if (!validPassword) {
      throw exception.badRequest('Incorrect password');
    }

    const isSamePassword = passwords.compare(newPassword, user.password);
    if (isSamePassword) {
      throw exception.badRequest('New password cannot be the same as the old password');
    }

    validatePassword(newPassword, user.email, user.username);

    const hash = passwords.hash(newPassword);

    return userRepo.updatePassword(user.id, hash);
  },
});
