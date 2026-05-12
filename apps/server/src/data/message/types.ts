import type { CreateMessage, Message, UpdateMessage } from '../../entities/message';

export interface MessageRepo {
  create: (data: CreateMessage) => Promise<Message>;
  findByChatId: (chatId: number, page: number, limit: number) => Promise<Message[]>;
  findAllByChatId: (chatId: number, text: string) => Promise<Message[]>;
  findOne: (definition: Partial<Message>) => Promise<Message | null>;
  updateMessage: (id: number, definition: Partial<UpdateMessage>) => Promise<Message>;
  updateReactions: (id: number, userId: number, reaction: string) => Promise<Message | null>;
  getMessagePage: (chatId: number, messageId: number, limit: number) => Promise<number>;
  remove: (id: number) => Promise<{ removed: boolean }>;
}
