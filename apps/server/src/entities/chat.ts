import { BaseEntity } from '../data/EntityRepo';

export interface Chat extends BaseEntity {}

export interface ChatPreview {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  members: { userId: number; username: string; isOnline: boolean; lastseen: Date }[];
}

export interface CreateChat {}

export interface UpdateChat extends CreateChat {}
