import type { QueryClient } from '@tanstack/react-query';

import { WS_IN } from './consts/messageEvents';
import useChatUIStore from '../stores/chatUI';
import { updateMessageCache } from '../services/cache/updateMessageCache';
import { updateChatsCache } from '../services/cache/updateChats';
import { CACHE_OP } from './consts/chatEvents';
import { updatePinnedMessagesCache } from '../services/cache/updatePinnedMessagesCache';
import { useUserStatus } from '../stores/userStatus';
import useCallsStore from '../stores/calls';

export function handleSocketMessage(event: MessageEvent, queryClient: QueryClient) {
  const { currentChatId, anchorMessageId, setCurrentChatId, setCurrentChatInfo } = useChatUIStore.getState();

  let data;
  try {
    data = JSON.parse(event.data);
  } catch (e) {
    console.error('Parse error:', e, event.data);
    return;
  }

  switch (data.type) {
    case WS_IN.NEW_MESSAGE:
      updateMessageCache({
        queryClient,
        anchorMessageId,
        chatId: data.payload.chatId,
        wsEvent: { type: 'add', payload: data.payload },
      });
      updateChatsCache({
        queryClient,
        payload: {
          type: CACHE_OP.CHAT_UPDATE,
          chatId: data.payload.chatId,
          data: data.payload,
        },
      });
      break;

    case WS_IN.MESSAGE_UPDATED:
      updateMessageCache({
        queryClient,
        anchorMessageId,
        chatId: data.payload.chatId,
        wsEvent: { type: 'update', payload: data.payload },
      });
      updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'edit', data: data.payload } });
      break;

    case WS_IN.MESSAGE_REACTIONS_UPDATED:
      updateMessageCache({
        queryClient,
        anchorMessageId,
        chatId: currentChatId!,
        wsEvent: { type: 'reaction-update', payload: data.payload },
      });
      updatePinnedMessagesCache({
        queryClient,
        currentChatId: data.payload.chatId,
        action: { type: 'edit', data: data.payload },
      });
      break;

    case WS_IN.MESSAGE_DELETED:
      updateMessageCache({
        queryClient,
        anchorMessageId,
        chatId: data.payload.chatId,
        wsEvent: { type: 'delete', payload: data.payload },
      });
      // TODO change updatedAt to last message createdAt time
      // TODO updateChatsCache({ queryClient, type: CACHE_OP.CHAT_UPDATE, chatId: data.payload.chatId, data: data.payload });
      updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'unpin', data: data.payload } });
      break;

    case WS_IN.INITIAL_STATUSES:
      useUserStatus.getState().setStatuses(data.payload);
      break;

    case WS_IN.STATUS:
      const { userId, isOnline, lastseen } = data.payload;
      useUserStatus.getState().updateStatus(userId, isOnline, lastseen);
      break;

    case CACHE_OP.CHAT_DELETED:
      updateChatsCache({
        queryClient,
        payload: {
          type: CACHE_OP.CHAT_DELETED,
          chatId: data.payload.id,
          data: data.payload.id,
        },
      });
      setCurrentChatId(null);
      setCurrentChatInfo(null);
      break;

    case CACHE_OP.CHAT_CREATE:
      updateChatsCache({
        queryClient,
        payload: {
          type: CACHE_OP.CHAT_CREATE,
          chatId: data.payload.id,
          data: data.payload,
        },
      });
      setCurrentChatId(data.payload.id);
      setCurrentChatInfo(data.payload);
      break;
    case WS_IN.IS_TYPING:
      useChatUIStore.getState().setIsTyping(data.payload.userName, data.payload.chatId, true);
      break;

    case WS_IN.STOP_TYPING:
      useChatUIStore.getState().setIsTyping(data.payload.userName, data.payload.chatId, false);
      break;

    case WS_IN.PINNED_MESSAGE: {
      const { messageId, isPinned, chatId } = data.payload;

      updateMessageCache({
        queryClient,
        anchorMessageId,
        chatId,
        wsEvent: { type: 'pin', payload: { messageId, isPinned } },
      });
      updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'pin' } });
      break;
    }

    case WS_IN.UNPINNED_MESSAGE: {
      const { chatId, messageId } = data.payload;

      updateMessageCache({
        queryClient,
        anchorMessageId,
        chatId,
        wsEvent: { type: 'unpin', payload: { chatId, messageId } },
      });
      updatePinnedMessagesCache({ queryClient, currentChatId, action: { type: 'unpin', data: data.payload } });
      break;
    }

    case WS_IN.INCOMING_CALL: {
      useCallsStore
        .getState()
        .setIncomingCall(data.payload.chatId, data.payload.roomName, data.payload.chatName, data.payload.type);
      break;
    }

    default:
      break;
  }
}
