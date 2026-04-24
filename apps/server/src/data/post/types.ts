import type { Post, CreatePost, UpdatePost,  } from '../../entities/post';

export interface PostRepo {
  create: (post: CreatePost) => Promise<Post>;
  findOne: (definition: Partial<Post>) => Promise<Post | null>;
  findById: (id: number) => Promise<Post | null>;
  findAll: () => Promise<Post[]>;
  findByCategory: (category: string) => Promise<Post[]>;
  findByUserId: (userId: number) => Promise<Post[]>;
  update: (id: number, definition: Partial<UpdatePost>) => Promise<Post>;
  remove: (id: number) => Promise<{ removed: boolean }>;
  exists: (definition: Partial<Post>) => Promise<boolean>;
  existsById: (id: number) => Promise<boolean>;
}
