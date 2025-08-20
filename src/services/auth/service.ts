import { exception } from '../../utils/exception/util.js';
import { passwords } from '../../utils/passwords/util.js';
import { sessions } from '../../utils/sessions/utils.js';
import type { AuthService, Deps } from './types.js';

export const init = ({ userRepo }: Deps): AuthService => ({
  signIn: async (usernameOrEmail, password) => {
    const user = await userRepo.findOneByUsernameOrEmail(usernameOrEmail, true);
    if (!user) {
      throw exception.badRequest('BAD_CREDENTIAL');
    }

    if (!user.password) {
      throw exception.badRequest('BAD_CREDENTIAL');
    }

    const validPassword = passwords.compare(password, user.password);
    if (!validPassword) {
      throw exception.badRequest('BAD_CREDENTIAL');
    }

    return sessions.generate(user);
  },

  signUp: async (email, username, password) => {
    // Check if user already exists
    const existingUser = await userRepo.isExists({ email });
    if (existingUser) {
      throw exception.badRequest('EMAIL_ALREADY_IN_USE');
    }

    const existingUsername = await userRepo.isExists({ username });
    if (existingUsername) {
      throw exception.badRequest('USERNAME_UNAVAILABLE');
    }

    // Hash password
    const hashedPassword = passwords.hash(password);

    // Create user with hashed password
    const user = await userRepo.create({
      email,
      username,
      password: hashedPassword,
    });

    return sessions.generate(user);
  },

  signOut: async (userId) => {
    return { signedOut: true };
  },

  verify: async (token) => {
    const payload = sessions.validate('access', token);
    const user = await userRepo.findOne({ id: payload.id });
    if (!user) {
      throw exception.notFound('USER_NOT_FOUND');
    }

    return user;
  },

  refresh: async (userId) => {
    const user = await userRepo.findOne({ id: userId });
    if (!user) {
      throw exception.notFound('USER_NOT_FOUND');
    }

    return sessions.generate(user);
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    const user = await userRepo.findOne({ id: userId }, true);
    if (!user) {
      throw exception.notFound('USER_NOT_FOUND');
    }

    if (!user.password) {
      throw exception.badRequest('INCORRECT_PASSWORD');
    }

    const validPassword = passwords.compare(oldPassword, user.password);
    if (!validPassword) {
      throw exception.badRequest('INCORRECT_PASSWORD');
    }

    const hash = passwords.hash(newPassword);

    return userRepo.updatePassword(user.id, hash);
  },
});
