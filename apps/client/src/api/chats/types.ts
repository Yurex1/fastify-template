import type { PINNED_MESSAGES_ACTION } from '../../utils/consts/pinned';
import type { DeletePayload } from '../../websocket/consts/payloads';
import type { Member } from '../user/types';

//Chats
export type Chat = {
  id: number;
  createdAt: string;
  updatedAt: string;
  members: Member[];
  lastMessage: Message | null;
};

export type ChatPageParam = { updatedAt?: string } | null;
export type MessagePageParam = { before?: number; after?: number } | null;

export interface ChatList {
  chats: Chat[];
  nextCursor?: { id: number | null; updatedAt: string | null };
}

//  Messages
export type Message = {
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
};

export interface MessageList {
  messages: Message[];
  newerCursor: number | null;
  olderCursor: number | null;
}

// Pinned Messages
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
  nextCursor: { id: number | null; createdAt: string | null };
}

export type PinnedPage = { data: PinnedMessage[]; totalCount: number };

export type PinnedMessagesPayload =
  | { type: typeof PINNED_MESSAGES_ACTION.PIN }
  | { type: typeof PINNED_MESSAGES_ACTION.UNPIN; data: DeletePayload }
  | { type: typeof PINNED_MESSAGES_ACTION.EDIT; data: Partial<Message> & { id: number } };

// form
export type FormMode = 'create' | 'edit' | 'search' | 'reply';
