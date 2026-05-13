import { Message } from './message';
import { BaseEntity } from '../data/EntityRepo';

export interface PinnedMessage extends BaseEntity {
  message?: Message;
  chat_id: number;
  message_id: number;
  pinned_at: Date;
}

export interface LastPinnedMessageStats {
  chat_id: number;
  message_id: number;
  pinned_at: Date;
  text: string;
  total_count: number;
}

export type CreatePinnedMessage = Omit<PinnedMessage, keyof BaseEntity>;
