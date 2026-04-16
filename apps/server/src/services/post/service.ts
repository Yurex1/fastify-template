import { exception } from '../../utils/exception/util';
import type { PostService, Deps } from './types';

export const init = ({ postRepo }: Deps): PostService => ({
  create: async (post) => {
    // Validate that the user exists (you might want to inject userRepo here for validation)
    // For now, we'll assume the userId is valid
    return postRepo.create(post);
  },

  findOne: async (definition) => {
    const post = await postRepo.findOne(definition);
    if (!post) throw exception.notFound('POST_NOT_FOUND');
    return post;
  },

  findById: async (id) => {
    const post = await postRepo.findById(id);
    if (!post) throw exception.notFound('POST_NOT_FOUND');
    return post;
  },

  findAll: async () => {
    return postRepo.findAll();
  },

  findByCategory: async (category) => {
    return postRepo.findByCategory(category);
  },

  findByUserId: async (userId) => {
    return postRepo.findByUserId(userId);
  },

  update: async (id, definition) => {
    // Check if post exists before updating
    const existingPost = await postRepo.findById(id);
    if (!existingPost) throw exception.notFound('POST_NOT_FOUND');
    
    return postRepo.update(id, definition);
  },

  remove: async (id) => {
    const post = await postRepo.findById(id);
    if (!post) throw exception.notFound('POST_NOT_FOUND');

    return postRepo.remove(id);
  },

  isExists: async (definition) => {
    return postRepo.exists(definition);
  },
});
