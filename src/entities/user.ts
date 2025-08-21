export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUser {
  email: string;
  username: string;
  password: string;
}

export interface UpdateUser extends Partial<CreateUser> {}

export type UserResult = User;

export type ListUser = Pick<User, 'id' | 'username'>;
