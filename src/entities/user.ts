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

export interface UpdateUser {
  email?: string;
  username?: string;
  password?: string;
}

export type UserResult = User;

export type ListUser = Pick<User, 'id' | 'username'>;
