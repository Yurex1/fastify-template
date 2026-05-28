import useChatUIStore from '../../stores/chatUI';
import { useUserStatus } from '../../stores/userStatus';
import type { UserStatusPayload, WsFrame } from '../consts/payloads';

type TypingPayload = { userName: string; chatId: number };

export function handleInitialStatuses(data: WsFrame<UserStatusPayload[]>) {
  useUserStatus.getState().setStatuses(data.payload);
}

export function handleUserStatus(data: WsFrame<UserStatusPayload>) {
  const { userId, isOnline, lastseen } = data.payload;
  useUserStatus.getState().updateStatus(userId, isOnline, lastseen);
}

export function handleTyping(data: WsFrame<TypingPayload>) {
  useChatUIStore.getState().setIsTyping(data.payload.userName, data.payload.chatId, true);
}

export function handleStopTyping(data: WsFrame<TypingPayload>) {
  useChatUIStore.getState().setIsTyping(data.payload.userName, data.payload.chatId, false);
}
