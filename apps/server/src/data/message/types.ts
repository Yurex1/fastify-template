import type { CreateMessage, Message, MessageSearchResult, UpdateMessage } from '../../entities/message';

export interface MessageRepo {
  create: (data: CreateMessage) => Promise<Message>;
  findByChatId: (chatId: number, { before, after, limit }: FindByChatIdProps) => Promise<CursorResult>;
  findAllByChatId: (chatId: number, text: string) => Promise<MessageSearchResult[]>;
  findOne: (definition: Partial<Message>) => Promise<Message | null>;
  findLastMessageByChatId: (chatId: number) => Promise<Message | null>;
  updateMessage: (id: number, definition: Partial<UpdateMessage>) => Promise<Message>;
  updateReactions: (id: number, userId: number, reaction: string) => Promise<Message | null>;
  getMessageContext: (
    chatId: number,
    messageId: number,
    limit: number,
  ) => Promise<{ messages: Message[]; olderCursor: number | null; newerCursor: number | null } | null>;
  remove: (id: number) => Promise<{ removed: boolean }>;
}

export interface FindByChatIdProps {
  before: number | null;
  after: number | null;
  limit: number;
}

export interface CursorResult {
  messages: Message[];
  olderCursor: number | null;
  newerCursor: number | null;
}
