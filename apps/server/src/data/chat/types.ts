import { Chat, CreateChat, UpdateChat } from '../../entities/chat';

export interface ChatRepo {
  create: (chat: CreateChat) => Promise<Chat>;
  findOne: (definition: Partial<Chat>) => Promise<Chat | null>;
  update: (id: number, definition: Partial<UpdateChat>) => Promise<Chat>;
  remove: (id: number) => Promise<{ removed: boolean }>;
}
