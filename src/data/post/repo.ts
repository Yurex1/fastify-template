import type { TypedPool } from '../../infra/pg';
import type { Post, CreatePost, UpdatePost, PostResult } from '../../entities/post';
import type { PostRepo } from './types';
import { EntityRepo } from '../EntityRepo';
import { selectByCategory, selectByUserId } from './sql';

class PostRepository extends EntityRepo<Post> {
  constructor(pool: TypedPool) {
    super(pool, 'posts', ['id', 'title', 'body', 'category', 'userId', 'photo', 'createdAt', 'updatedAt']);
  }

  async findByCategory(category: string): Promise<Post[]> {
    const { query, params } = selectByCategory(category);
    return await this.pool.queryAll<Post>(query, params);
  }

  async findByUserId(userId: number): Promise<Post[]> {
    const { query, params } = selectByUserId(userId);
    return await this.pool.queryAll<Post>(query, params);
  }
}

export const init = (pool: TypedPool): PostRepo => {
  const postRepo = new PostRepository(pool);

  return {
    create: (post: CreatePost) => postRepo.create(post),
    findOne: (definition: Partial<Post>) => postRepo.findOne(definition),
    findById: (id: number) => postRepo.findById(id),
    findAll: () => postRepo.findAll(),
    findByCategory: (category: string) => postRepo.findByCategory(category),
    findByUserId: (userId: number) => postRepo.findByUserId(userId),
    update: (id: number, definition: Partial<UpdatePost>) => postRepo.update(id, definition),
    remove: (id: number) => postRepo.remove(id),
    exists: (definition: Partial<Post>) => postRepo.exists(definition),
    existsById: (id: number) => postRepo.existsById(id),
  };
};
