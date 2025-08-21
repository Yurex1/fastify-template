import * as schemas from './schemas';
import type { UserApi, Deps } from './types';

export const init = ({ userService }: Deps): UserApi => ({
  id: {
    method: 'get',
    access: 'common',
    params: ['id'],
    schema: schemas.getById,
    handler: async (_user, request) => {
      const { id } = request.params;
      return userService.findOne({ id });
    },
  },

  'get-all': {
    method: 'get',
    access: 'common',
    schema: schemas.getAll,
    handler: async (_user, params) => {
      const users = await userService.findAll();
      return users;
    },
  },

  'update-email': {
    method: 'put',
    access: 'common',
    params: ['id'],
    schema: schemas.updateEmail,
    handler: async (_user, request) => {
      const { id } = request.params;
      const { email } = request.body;
      return userService.updateEmail(id, email);
    },
  },

  update: {
    method: 'put',
    access: 'common',
    params: ['id'],
    schema: schemas.update,
    handler: async (_user, request) => {
      const { id } = request.params;
      const updateData = request.body;
      return userService.update(id, updateData);
    },
  },

  remove: {
    method: 'delete',
    access: 'common',
    params: ['id'],
    schema: schemas.remove,
    handler: async (_user, request) => {
      const { id } = request.params;
      return userService.remove(id);
    },
  },
});
