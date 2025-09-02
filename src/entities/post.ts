import type { BaseEntity } from '../data/EntityRepo';

export interface Post extends BaseEntity {
  id: number;
  title: string;
  body: string;
  category: string;
  userId: number;
  photo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePost {
  title: string;
  body: string;
  category: string;
  userId: number;
  photo: string;
}

export interface UpdatePost extends Partial<CreatePost> {}

export type PostResult = Post;

export type ListPost = Pick<Post, 'id' | 'title' | 'category' | 'userId' | 'photo' | 'createdAt'>;
