import type { BaseEntity } from '../data/EntityRepo';

export interface User extends BaseEntity {
  id: number;
  email: string;
  username: string;
  password?: string | null;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastseen: Date;
}

export interface CreateUser {
  email: string;
  username: string;
  password?: string | null;
  googleId?: string | null;
}

export interface UpdateUser extends Partial<CreateUser> {}

export interface UserResult extends Omit<User, 'password'> {}

export type ListUser = Pick<User, 'id' | 'username'>;
