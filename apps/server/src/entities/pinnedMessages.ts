import { Message } from './message';
import { BaseEntity } from '../data/EntityRepo';

export interface PinnedMessageList {
  totalCount: number;
  data: PinnedMessage[];
}
export interface PinnedMessage extends BaseEntity {
  message?: Message;
  chat_id: number;
  message_id: number;
  pinned_at: Date;
}

export type CreatePinnedMessage = Omit<PinnedMessage, keyof BaseEntity>;
