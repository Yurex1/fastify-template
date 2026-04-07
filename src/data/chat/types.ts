import { Chat } from '../../entities/chat';

export interface ChatRepo {
  create: ({}) => Promise<Chat>;
  findOne: (definition: Partial<Chat>) => Promise<Chat | null>;
  remove: (id: number) => Promise<{ removed: boolean }>;
}
