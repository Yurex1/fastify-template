import type { UserRepo } from '../../data/user/types';
import type { User, CreateUser, UpdateUser, UserResult } from '../../entities/user';

export interface UserService {
  create: (user: CreateUser) => Promise<User>;
  findOne: (definition: Partial<User>, includePassword?: boolean) => Promise<UserResult>;
  findAll: () => Promise<User[]>;
  isExists: (definition: Partial<User>) => Promise<boolean>;
  update: (id: number, definition: Partial<UpdateUser>) => Promise<User>;
  updateEmail: (id: number, email: string) => Promise<User>;
  remove: (id: number) => Promise<{ removed: boolean }>;
}

export interface Deps {
  userRepo: UserRepo;
}
