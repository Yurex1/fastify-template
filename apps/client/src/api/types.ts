import type { PINNED_MESSAGES_ACTION } from '../utils/consts/pinned';

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
  createdAt: string;
  updatedAt: string;
  lastseen: string;
}

export interface Member extends User {
  isOnline: boolean;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt: string;
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
}
export interface PinnedMessageList {
  totalCount: number;
  data: PinnedMessage[];
}

export interface Message {
  id: number;
  userId: number;
  username: string;
  chatId: number;
  text: string;
  reactions: Record<string, number[]>;
  reply_id: number | null;
  reply?: { id: number; text: string; userId: number; username: string; createdAt: string } | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FormMode = 'create' | 'edit' | 'search' | 'reply';

export type WSEvent =
  | { type: 'add'; payload: Message }
  | { type: 'update'; payload: Message }
  | { type: 'pin'; payload: PinPayload }
  | { type: 'unpin'; payload: DeletePayload }
  | { type: 'delete'; payload: DeletePayload };

export type Action = WSEvent['type'];

type UserStatusPayload = {
  userId: number;
  isOnline: boolean;
  lastseen?: string;
};

export type DeletePayload = {
  messageId: number;
  chatId: number;
};

export type Payload = Message | UserStatusPayload | UserStatusPayload[] | DeletePayload;

type PinPayload = {
  messageId: number;
  isPinned: boolean;
};

export type PinnedPage = { data: PinnedMessage[]; totalCount: number };
export type PinnedMessagesPayload =
  | { type: typeof PINNED_MESSAGES_ACTION.PIN }
  | { type: typeof PINNED_MESSAGES_ACTION.UNPIN; data: DeletePayload }
  | { type: typeof PINNED_MESSAGES_ACTION.EDIT; data: Partial<Message> & { id: number } };

export type PageData = { messages: Message[]; page: number };
