import type { BaseEntity } from '../data/EntityRepo';

export interface User extends BaseEntity {
  id: number;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  lastseen: Date;
}

export interface CreateUser {
  email: string;
  username: string;
  password: string;
}

export interface UpdateUser extends Partial<CreateUser> {}

export type UserResult = User;

export type ListUser = Pick<User, 'id' | 'username'>;
