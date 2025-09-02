import type { PostService } from '../../services/post/types';
import type { ProtectedEndpoint, UnprotectedEndpoint, API } from '../types';
import type { Post, CreatePost, UpdatePost, PostResult } from '../../entities/post';

export interface PostApi extends API {
  create: ProtectedEndpoint<{ body: CreatePost }, Promise<Post>>;
  'get-by-id': ProtectedEndpoint<{ params: { id: number } }, Promise<PostResult>>;
  'get-all': ProtectedEndpoint<{}, Promise<Post[]>>;
  'get-by-category': ProtectedEndpoint<{ query: { category: string } }, Promise<Post[]>>;
  'get-by-user': ProtectedEndpoint<{ query: { userId: number } }, Promise<Post[]>>;
  update: ProtectedEndpoint<{ params: { id: number }; body: UpdatePost }, Promise<Post>>;
  remove: ProtectedEndpoint<{ params: { id: number } }, Promise<{ removed: boolean }>>;
}

export interface Deps {
  postService: PostService;
}
