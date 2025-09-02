import type { PostRepo } from '../../data/post/types';
import type {
  Post,
  CreatePost,
  UpdatePost,
  PostResult,
} from '../../entities/post';

export interface PostService {
  create: (post: CreatePost) => Promise<Post>;
  findOne: (definition: Partial<Post>) => Promise<PostResult>;
  findById: (id: number) => Promise<PostResult>;
  findAll: () => Promise<Post[]>;
  findByCategory: (category: string) => Promise<Post[]>;
  findByUserId: (userId: number) => Promise<Post[]>;
  update: (id: number, definition: Partial<UpdatePost>) => Promise<Post>;
  remove: (id: number) => Promise<{ removed: boolean }>;
  isExists: (definition: Partial<Post>) => Promise<boolean>;
}

export interface Deps {
  postRepo: PostRepo;
}
