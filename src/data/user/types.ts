import type { Pool } from 'pg';
import type {
  User,
  CreateUser,
  UpdateUser,
  UserResult,
} from '../../entities/user.js';

//
export interface UserRepo {
  create: (user: CreateUser) => Promise<User>;

  findOne: (
    definition: Partial<User>,
    includePassword?: boolean,
  ) => Promise<UserResult>;
  findOneByUsernameOrEmail: (
    value: string,
    includePassword?: boolean,
  ) => Promise<User | null>;
  findByIds: (userIds: number[]) => Promise<User[]>;
  isExists: (definition: Partial<User>) => Promise<boolean>;
  update: (id: number, definition: Partial<UpdateUser>) => Promise<User>;
  updateEmail: (id: number, email: string) => Promise<User>;
  updatePassword: (id: number, password: string) => Promise<User>;
  remove: (id: number) => Promise<{ removed: boolean }>;
}

export type init = (pg: Pool) => UserRepo;
