import type { CreateMessage, Message, UpdateMessage } from '../../entities/message';

export interface MessageRepo {
  create: (data: CreateMessage) => Promise<Message>;
  findByChatId: (chatId: number, page: number, limit: number) => Promise<Message[]>;
  findOne: (definition: Partial<Message>) => Promise<Message | null>;
  updateMessage: (id: number, definition: Partial<UpdateMessage>) => Promise<Message>;
  remove: (id: number) => Promise<{ removed: boolean }>;
}
