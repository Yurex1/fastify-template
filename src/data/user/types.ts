import type { TypedPool } from '../../infra/pg';
import type { User, CreateUser, UpdateUser, UserResult } from '../../entities/user';

export interface UserRepo {
  create: (user: CreateUser) => Promise<User>;
  findOne: (definition: Partial<User>, includePassword?: boolean) => Promise<UserResult>;
  findById: (id: number) => Promise<User | null>;
  findAll: () => Promise<User[]>;
  update: (id: number, definition: Partial<UpdateUser>) => Promise<User>;
  remove: (id: number) => Promise<{ removed: boolean }>;
  exists: (definition: Partial<User>) => Promise<boolean>;
  existsById: (id: number) => Promise<boolean>;

  findOneByUsernameOrEmail: (value: string, includePassword?: boolean) => Promise<User | null>;
  updateEmail: (id: number, email: string) => Promise<User>;
  updatePassword: (id: number, password: string) => Promise<User>;
}

export type init = (pg: TypedPool) => UserRepo;
