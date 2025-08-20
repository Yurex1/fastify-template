import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schemas.js';
import type { User, UserResult } from '../../entities/user.js';
import type { UserService } from '../../services/user/types.js';
import type { ProtectedEndpoint, UnprotectedEndpoint, API } from '../types.js';

type CreateParam = SchemaType.FromSchema<typeof schemas.create>;
type FindOneParam = SchemaType.FromSchema<typeof schemas.findOne>;
type FindByUsernameOrEmailParam = SchemaType.FromSchema<
  typeof schemas.findByUsernameOrEmail
>;
type FindByIdsParam = SchemaType.FromSchema<typeof schemas.findByIds>;
type IsExistsParam = SchemaType.FromSchema<typeof schemas.isExists>;
type UpdateParam = SchemaType.FromSchema<typeof schemas.update>;
type UpdateEmailParam = SchemaType.FromSchema<typeof schemas.updateEmail>;
type RemoveParam = SchemaType.FromSchema<typeof schemas.remove>;

export interface UserApi extends API {
  'find-one': ProtectedEndpoint<FindOneParam, Promise<UserResult>>;
  'find-by-username-or-email': UnprotectedEndpoint<
    FindByUsernameOrEmailParam,
    Promise<User | null>
  >;
  'find-by-ids': ProtectedEndpoint<FindByIdsParam, Promise<User[]>>;
  'is-exists': UnprotectedEndpoint<IsExistsParam, Promise<{ exists: boolean }>>;
  update: ProtectedEndpoint<UpdateParam, Promise<User>>;
  'update-email': ProtectedEndpoint<UpdateEmailParam, Promise<User>>;
  remove: ProtectedEndpoint<RemoveParam, Promise<{ removed: boolean }>>;
}

export interface Deps {
  userService: UserService;
}
