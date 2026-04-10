import { BaseEntity } from '../data/EntityRepo';

export interface Message extends BaseEntity {
  userId: number;
  chatId: number;
  text: string;
}

export type CreateMessage = Omit<Message, keyof BaseEntity>;

export interface UpdateMessage extends CreateMessage {}
