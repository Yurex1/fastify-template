import type { Message } from '../../api/chats/types';

export type DeletePayload = { messageId: number; chatId: number };
export type PinPayload = { messageId: number; isPinned: boolean };
export type ReactionPayload = { id: number; reactions: Record<string, number[]> };
export type UserStatusPayload = { userId: number; isOnline: boolean; lastseen?: string };
export type IncomingCallPayload = { chatId: number; roomName: string };

export type WSEvent =
  | { type: 'add'; payload: Message }
  | { type: 'update'; payload: Message }
  | { type: 'reaction-update'; payload: ReactionPayload }
  | { type: 'pin'; payload: PinPayload }
  | { type: 'unpin'; payload: DeletePayload }
  | { type: 'delete'; payload: DeletePayload }
  | { type: 'incomingCall'; payload: IncomingCallPayload };

export type WsFrame<T = unknown> = { type: string; payload: T };
