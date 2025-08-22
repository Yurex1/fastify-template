import { exception } from '../../utils/exception/util';
import { passwords } from '../../utils/passwords/util';
import { sessions } from '../../utils/sessions/utils';
import type { AuthService, Deps } from './types';

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
    const existingUser = await userRepo.isExists({ email });
    if (existingUser) {
      throw exception.badRequest('EMAIL_ALREADY_IN_USE');
    }

    const existingUsername = await userRepo.isExists({ username });
    if (existingUsername) {
      throw exception.badRequest('USERNAME_UNAVAILABLE');
    }

    const hashedPassword = passwords.hash(password);

    const user = await userRepo.create({
      email,
      username,
      password: hashedPassword,
    });

    return sessions.generate(user);
  },

  signOut: async (userId) => {
    return { signedOut: true }; //TODO: implement signOut
  },

  verify: async (access, authHeaders) => {
    try {
      if (!authHeaders) throw exception.unauthorized('NO_TOKEN_PROVIDED');
      const [bearer, accessToken, refreshToken] = authHeaders.split(' ');

      if (bearer !== 'Bearer' || (!accessToken && !refreshToken))
        throw exception.unauthorized('INVALID_OAUTH_HEADERS');

      const type = access === 'refresh' ? 'refresh' : 'access';
      const token = { access: accessToken, refresh: refreshToken }[type];

      const payload = sessions.validate(type, token);
      if (!payload.id) throw exception.unauthorized('INVALID_TOKEN_PAYLOAD');

      const user = await userRepo.findOne({ id: payload.id });
      if (!user) throw exception.notFound('USER_NOT_FOUND');

      return user;
    } catch (err) {
      if (exception.isCustomException(err)) throw err;
      throw exception.unauthorized();
    }
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

    const isSamePassword = passwords.compare(newPassword, user.password);
    if (isSamePassword) {
      throw exception.badRequest('NEW_PASSWORD_SAME_AS_OLD');
    }

    const hash = passwords.hash(newPassword);

    return userRepo.updatePassword(user.id, hash);
  },
});
