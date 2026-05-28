import { Message } from './message';
import { BaseEntity } from '../data/EntityRepo';
import { PinnedMessagesCursor } from '../data/pinnedMessages/types';

export interface PinnedMessageList {
  data: PinnedMessage[];
  totalCount: number;
  nextCursor: PinnedMessagesCursor | null;
}
export interface PinnedMessage extends BaseEntity {
  message?: Message;
  chat_id: number;
  message_id: number;
  pinned_at: Date;
}

export type CreatePinnedMessage = Omit<PinnedMessage, keyof BaseEntity>;
