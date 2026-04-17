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

  member: {
    id: number;
    username: string;
  };

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

export type FormMode = 'create' | 'edit';
