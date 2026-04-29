import { BaseEntity } from '../data/EntityRepo';

export interface Message extends BaseEntity {
  userId: number;
  chatId: number;
  text: string;
  reactions?: Record<string, number[]>;
}

export type CreateMessage = Omit<Message, keyof BaseEntity>;

export type UpdateMessage = Partial<{
  text: string;
  reactions: {};
}>;
