import type { User } from '../../entities/user';
import type { UserService } from '../../services/user/types';
import type { ProtectedEndpoint, API } from '../types';
import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schemas';

type GetByIdParam = SchemaType.FromSchema<typeof schemas.getById>;
type UpdateEmailParam = SchemaType.FromSchema<typeof schemas.updateEmail>;
type UpdateParam = SchemaType.FromSchema<typeof schemas.update>;
type RemoveParam = SchemaType.FromSchema<typeof schemas.remove>;

export interface UserApi extends API {
  id: ProtectedEndpoint<GetByIdParam, Promise<User>>;
  'get-all': ProtectedEndpoint<unknown, Promise<User[]>>;
  'update-email': ProtectedEndpoint<UpdateEmailParam, Promise<User>>;
  update: ProtectedEndpoint<UpdateParam, Promise<User>>;
  remove: ProtectedEndpoint<RemoveParam, Promise<{ removed: boolean }>>;
}

export interface Deps {
  userService: UserService;
}
