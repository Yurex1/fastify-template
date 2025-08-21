import * as schemas from './schemas';
import type { UserApi, Deps } from './types';

export const init = ({ userService }: Deps): UserApi => ({
  'find-one': {
    method: 'post',
    access: 'common',
    schema: schemas.findOne,
    handler: async (_user, request) => {
      const { definition, includePassword = false } = request.body;
      return userService.findOne(definition, includePassword);
    },
  },

  'find-by-username-or-email': {
    method: 'get',
    access: 'none',
    schema: schemas.findByUsernameOrEmail,
    handler: async (_user, request) => {
      const { value, includePassword = false } = request.query;
      return userService.findOneByUsernameOrEmail(value, includePassword);
    },
  },

  'find-by-ids': {
    method: 'post',
    access: 'common',
    schema: schemas.findByIds,
    handler: async (_user, request) => {
      return userService.findByIds(request.body.userIds);
    },
  },

  'is-exists': {
    method: 'post',
    access: 'none',
    schema: schemas.isExists,
    handler: async (_user, request) => {
      const exists = await userService.isExists(request.body.definition);
      return { exists };
    },
  },

  update: {
    method: 'put',
    access: 'common',
    schema: schemas.update,
    params: ['id'],
    handler: async (_user, request) => {
      const { id } = request.params;
      return userService.update(id, request.body);
    },
  },

  'update-email': {
    method: 'put',
    access: 'common',
    schema: schemas.updateEmail,
    params: ['id'],
    handler: async (_user, request) => {
      const { id } = request.params;
      const { email } = request.body;
      return userService.updateEmail(id, email);
    },
  },

  remove: {
    method: 'delete',
    access: 'common',
    schema: schemas.remove,
    params: ['id'],
    handler: async (_user, request) => {
      const { id } = request.params;
      return userService.remove(id);
    },
  },
});
