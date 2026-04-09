import { BaseEntity } from '../data/EntityRepo';

export interface Chat extends BaseEntity {
  title: string;
}

export interface CreateChat {
  text: string;
}

export interface UpdateChat extends CreateChat {}
