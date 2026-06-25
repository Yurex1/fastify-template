import type { TypedPool } from '../../infra/pg';
import type { User, CreateUser, UpdateUser } from '../../entities/user';

export interface UserRepo {
  create: (user: CreateUser) => Promise<User>;
  findOne: (definition: Partial<User>, includePassword?: boolean) => Promise<User | null>;
  findById: (id: number) => Promise<User | null>;
  findAll: () => Promise<User[]>;
  update: (id: number, definition: Partial<UpdateUser>) => Promise<User>;
  remove: (id: number) => Promise<{ removed: boolean }>;
  exists: (definition: Partial<User>) => Promise<boolean>;
  existsById: (id: number) => Promise<boolean>;
  findOneByLoginIdentifier: (value: string, includePassword?: boolean) => Promise<User | null>;
  updateEmail: (id: number, email: string) => Promise<User | null>;
  updatePassword: (id: number, password: string) => Promise<User | null>;
  updateLastSeen: (id: number) => Promise<User | null>;
}

export type init = (pg: TypedPool) => UserRepo;
