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
export interface Member {
  userId: number;
  username: string;
  isOnline: boolean;
  lastseen: string;
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
  members: Member[];
}

export interface PinnedMessage {
  id: number;
  chat_id: number;
  message: Message;
  message_id: number;
  pinned_at: Date;
  chatId: number;
  messageId: number;
  isPinned: boolean;
}

export interface Message {
  id: number;
  userId: number;
  chatId: number;
  text: string;
  reactions: Record<string, number[]>;
  reply_id: number | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FormMode = 'create' | 'edit' | 'search' | 'reply';

export type WSEvent =
  | { type: 'add'; payload: Message }
  | { type: 'update'; payload: Message }
  | { type: 'pin'; payload: PinPayload }
  | { type: 'unpin'; payload: { messageId: number; chatId: number } }
  | { type: 'delete'; payload: { messageId: number; chatId: number } };

export type Action = WSEvent['type'];

export interface Payload {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  isActive: boolean;
  lastSeen: string;
  onlineIds: number[];
}

type PinPayload = {
  messageId: number;
  isPinned: boolean;
};
