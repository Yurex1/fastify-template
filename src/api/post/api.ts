import * as schemas from './schemas';
import type { PostApi, Deps } from './types';

export const init = ({ postService }: Deps): PostApi => ({
  create: {
    method: 'post',
    access: 'common',
    schema: schemas.create,
    handler: async (user, request) => {
      const { title, body, category, photo } = request.body;
      return postService.create({
        title,
        body,
        category,
        userId: user.id,
        photo,
      });
    },
  },

  'get-by-id': {
    method: 'get',
    access: 'common',
    params: ['id'],
    schema: schemas.getById,
    handler: async (_user, request) => {
      const { id } = request.params;
      return postService.findById(id);
    },
  },

  'get-all': {
    method: 'get',
    access: 'common',
    schema: schemas.getAll,
    handler: async (_user, _params) => {
      return postService.findAll();
    },
  },

  'get-by-category': {
    method: 'get',
    access: 'common',
    schema: schemas.getByCategory,
    handler: async (_user, request) => {
      const { category } = request.query;
      return postService.findByCategory(category);
    },
  },

  'get-by-user': {
    method: 'get',
    access: 'common',
    schema: schemas.getByUser,
    handler: async (user, _request) => {
      return postService.findByUserId(user.id);
    },
  },

  update: {
    method: 'put',
    access: 'common',
    params: ['id'],
    schema: schemas.update,
    handler: async (_user, request) => {
      const { id } = request.params;
      const { title, body, category, photo } = request.body;
      return postService.update(id, { title, body, category, photo });
    },
  },

  remove: {
    method: 'delete',
    access: 'common',
    params: ['id'],
    schema: schemas.remove,
    handler: async (_user, request) => {
      const { id } = request.params;
      return postService.remove(id);
    },
  },
});
