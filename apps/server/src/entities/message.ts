import { BaseEntity } from '../data/EntityRepo';

export interface Message extends BaseEntity {
  userId: number;
  chatId: number;
  text: string;
  read?: boolean;
  reactions?: Record<string, number[]>;
  reply_id?: number | null;
  reply?: {
    id: number;
    text: string;
    userId: number;
    username: string;
    createdAt: string;
  } | null;
}

export type CreateMessage = Omit<Message, keyof BaseEntity>;

export type UpdateMessage = Partial<{
  text: string;
  reactions: {};
  read: boolean;
}>;

export type MessageSearchResult = Pick<Message, 'id' | 'text' | 'createdAt' | 'chatId'>;
