import type { BaseEntity } from '../data/EntityRepo';

export interface Post extends BaseEntity {
  title: string;
  body: string;
  category: string;
  userId: number;
  photo: string;
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
