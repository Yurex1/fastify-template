import type { CreateMessage, Message, UpdateMessage } from '../../entities/message';

export interface MessageRepo {
  create: (data: CreateMessage) => Promise<Message>;
  findByUserIdAndChatId: (userId: number, chatId: number) => Promise<Message[]>;
  findOne: (definition: Partial<Message>) => Promise<Message | null>;
  updateMessage: (id: number, userId: number, definition: Partial<UpdateMessage>) => Promise<Message>;
  remove: (id: number) => Promise<{ removed: boolean }>;
}
