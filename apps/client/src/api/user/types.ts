export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  lastseen: string;
}

export interface Member extends User {
  isOnline: boolean;
  userId?: number;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt: string;
}
