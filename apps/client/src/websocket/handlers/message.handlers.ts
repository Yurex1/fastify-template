import type { QueryClient } from '@tanstack/react-query';
import { CACHE_OP } from '../consts/chatEvents';
import { updateMessageCache } from '../../utils/updateMessageCache';
import { updateChatsCache } from '../../utils/updateChats';
import { updatePinnedMessagesCache } from '../../utils/updatePinnedMessagesCache';
import useChatUIStore from '../../stores/chatUI';
import type { DeletePayload, PinPayload, ReactionPayload, WsFrame } from '../consts/payloads';
import type { Message } from '../../api/chats/types';

export function handleNewMessage(data: WsFrame<Message>, queryClient: QueryClient) {
  const { currentChatId, anchorMessageId } = useChatUIStore.getState();
  const chatId = data.payload.chatId ?? currentChatId!;

  updateMessageCache({ queryClient, anchorMessageId, chatId, wsEvent: { type: 'add', payload: data.payload } });
  updateChatsCache({ queryClient, type: CACHE_OP.CHAT_UPDATE, chatId, data: data.payload });
}

export function handleUpdatedMessage(data: WsFrame<Message>, queryClient: QueryClient) {
  const { currentChatId, anchorMessageId } = useChatUIStore.getState();
  const chatId = data.payload.chatId ?? currentChatId!;

  updateMessageCache({ queryClient, anchorMessageId, chatId, wsEvent: { type: 'update', payload: data.payload } });
  updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'edit', data: data.payload } });
}

export function handleReactionUpdated(data: WsFrame<ReactionPayload>, queryClient: QueryClient) {
  const { currentChatId, anchorMessageId } = useChatUIStore.getState();
  if (!currentChatId) return;

  updateMessageCache({
    queryClient,
    anchorMessageId,
    chatId: currentChatId,
    wsEvent: { type: 'reaction-update', payload: data.payload },
  });
  updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'edit', data: data.payload } });
}

export function handleDeletedMessage(data: WsFrame<DeletePayload>, queryClient: QueryClient) {
  const { currentChatId, anchorMessageId } = useChatUIStore.getState();
  const chatId = data.payload.chatId ?? currentChatId!;

  updateMessageCache({ queryClient, anchorMessageId, chatId, wsEvent: { type: 'delete', payload: data.payload } });
  updateChatsCache({ queryClient, type: CACHE_OP.CHAT_DELETE, chatId, data: data.payload });
  updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'unpin', data: data.payload } });
}

export function handlePinMessage(data: WsFrame<PinPayload & { chatId: number }>, queryClient: QueryClient) {
  const { currentChatId, anchorMessageId } = useChatUIStore.getState();
  const { messageId, isPinned, chatId } = data.payload;

  updateMessageCache({
    queryClient,
    anchorMessageId,
    chatId,
    wsEvent: { type: 'pin', payload: { messageId, isPinned } },
  });
  updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'pin' } });
}

export function handleUnpinMessage(data: WsFrame<DeletePayload>, queryClient: QueryClient) {
  const { currentChatId, anchorMessageId } = useChatUIStore.getState();
  const { chatId, messageId } = data.payload;

  updateMessageCache({
    queryClient,
    anchorMessageId,
    chatId,
    wsEvent: { type: 'unpin', payload: { chatId, messageId } },
  });
  updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'unpin', data: data.payload } });
}
