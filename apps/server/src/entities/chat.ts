import { BaseEntity } from '../data/EntityRepo';

export interface Chat extends BaseEntity {}

export interface ChatPreview {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  member: {
    id: number;
    username: string;
  };
}

export interface CreateChat {}

export interface UpdateChat extends CreateChat {}
