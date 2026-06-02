export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  lastseen: string;
}

export interface Member {
  username: string;
  userId: number;
  lastseen: string;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt: string;
}
