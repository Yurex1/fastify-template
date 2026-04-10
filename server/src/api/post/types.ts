import type { PostService } from '../../services/post/types';
import type { ProtectedEndpoint, API } from '../types';
import type { Post, PostResult } from '../../entities/post';

import { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

type CreateParam = FromSchema<typeof schemas.create>;
type GetByIdParam = FromSchema<typeof schemas.getById>;
type GetAllParam = FromSchema<typeof schemas.getAll>;
type GetByCategoryParam = FromSchema<typeof schemas.getByCategory>;
type GetByUserParam = FromSchema<typeof schemas.getByUser>;
type UpdateParam = FromSchema<typeof schemas.update>;
type RemoveParam = FromSchema<typeof schemas.remove>;

export interface PostApi extends API {
  create: ProtectedEndpoint<CreateParam, Post>;
  'get-by-id': ProtectedEndpoint<GetByIdParam, PostResult>;
  'get-all': ProtectedEndpoint<GetAllParam, Post[]>;
  'get-by-category': ProtectedEndpoint<GetByCategoryParam, Post[]>;
  'get-by-user': ProtectedEndpoint<GetByUserParam, Post[]>;
  update: ProtectedEndpoint<UpdateParam, Post>;
  remove: ProtectedEndpoint<RemoveParam, { removed: boolean }>;
}

export interface Deps {
  postService: PostService;
}
