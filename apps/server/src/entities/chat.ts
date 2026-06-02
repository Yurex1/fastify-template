import { BaseEntity } from '../data/EntityRepo';
import { Message } from './message';

export interface Chat extends BaseEntity {}

export interface ChatPreview {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  members: { userId: number; username: string; isOnline: boolean; lastseen: Date }[];
  lastMessage: Message | null;
}

export interface CreateChat {}

export interface UpdateChat extends CreateChat {}
