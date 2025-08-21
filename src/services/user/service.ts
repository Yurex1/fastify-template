import { exception } from '../../utils/exception/util';
import { passwords } from '../../utils/passwords/util';
import type { UserService, Deps } from './types';

export const init = ({ userRepo }: Deps): UserService => ({
  create: async (user) => {
    return userRepo.create(user);
  },

  findOne: async (definition, includePassword = false) => {
    return userRepo.findOne(definition, includePassword);
  },

  findOneByUsernameOrEmail: async (value, includePassword = false) => {
    return userRepo.findOneByUsernameOrEmail(value, includePassword);
  },

  findByIds: async (userIds) => {
    return userRepo.findByIds(userIds);
  },

  isExists: async (definition) => {
    return userRepo.isExists(definition);
  },

  update: async (id, definition) => {
    return userRepo.update(id, definition);
  },

  updateEmail: async (id, email) => {
    return userRepo.updateEmail(id, email);
  },

  updatePassword: async (id, oldPassword, newPassword) => {
    const user = await userRepo.findOne({ id }, true);
    if (!user) throw exception.notFound('USER_NOT_FOUND');

    if (!oldPassword) throw exception.badRequest('INCORRECT_PASSWORD');

    const validPassword = passwords.compare(oldPassword, user.password);
    if (!validPassword) throw exception.badRequest('INCORRECT_PASSWORD');

    const hash = passwords.hash(newPassword);

    return userRepo.updatePassword(user.id, hash);
  },

  remove: async (id) => {
    const user = await userRepo.findOne({ id }, true);
    if (!user) throw exception.notFound('USER_NOT_FOUND');

    return userRepo.remove(id);
  },
});
