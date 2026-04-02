import type { PostService } from '../../services/post/types';
import type { ProtectedEndpoint, API } from '../types';
import type { Post, PostResult } from '../../entities/post';

import { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type CreatePost = FromSchema<typeof schemas.create.properties.body>;
export type UpdatePost = FromSchema<typeof schemas.update.properties.body>;
export type PostParams = FromSchema<typeof schemas.getById.properties.params>;

export interface PostApi extends API {
  create: ProtectedEndpoint<{ body: CreatePost }, Promise<Post>>;

  'get-by-id': ProtectedEndpoint<{ params: { id: number } }, Promise<PostResult>>;
  'get-all': ProtectedEndpoint<{}, Promise<Post[]>>;
  'get-by-category': ProtectedEndpoint<{ query: { category: string } }, Promise<Post[]>>;
  'get-by-user': ProtectedEndpoint<{}, Promise<Post[]>>;

  update: ProtectedEndpoint<{ params: { id: number }; body: UpdatePost }, Promise<Post>>;

  remove: ProtectedEndpoint<{ params: { id: number } }, Promise<{ removed: boolean }>>;
}

export interface Deps {
  postService: PostService;
}
