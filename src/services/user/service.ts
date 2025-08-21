import { exception } from '../../utils/exception/util';
import type { UserService, Deps } from './types';

export const init = ({ userRepo }: Deps): UserService => ({
  create: async (user) => {
    return userRepo.create(user);
  },

  findOne: async (definition, includePassword = false) => {
    console.log('findOne', definition, includePassword);
    return userRepo.findOne(definition, includePassword);
  },

  findAll: async () => {
    return userRepo.findAll();
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

  remove: async (id) => {
    const user = await userRepo.findOne({ id }, true);
    if (!user) throw exception.notFound('USER_NOT_FOUND');

    return userRepo.remove(id);
  },
});
