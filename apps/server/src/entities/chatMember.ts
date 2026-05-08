import { BaseEntity } from '../data/EntityRepo';

export interface ChatMember extends BaseEntity {
  userId: number;
  username: string;
  isOnline: boolean;
  lastseen: Date;
}
