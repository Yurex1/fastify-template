export interface SignUp {
  email: string;
  username: string;
  password: string;
}

export interface SignIn {
  usernameOrEmail: string;
  password: string;
}

export interface ChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  lastseen: Date;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt: Date;
}

export interface Chat {
  id: number;
  createdAt: string;
  updatedAt: string;

  members: {
    id: number;
    username: string;
  }[];

  lastMessage?: {
    id: number;
    text: string;
    createdAt: string;
  };
}

export interface Message {
  id: number;
  userId: number;
  chatId: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type FormMode = 'create' | 'edit' | 'search';

export type WSEvent =
  | { type: 'add'; payload: Message }
  | { type: 'update'; payload: Message }
  | { type: 'delete'; payload: { messageId: number; chatId: number } };

export type Action = WSEvent['type'];
