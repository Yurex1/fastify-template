import type { QueryClient } from '@tanstack/react-query';
import { handleChatCreated } from './handlers/chat.handlers';
import {
  handleDeletedMessage,
  handleNewMessage,
  handlePinMessage,
  handleReactionUpdated,
  handleUnpinMessage,
  handleUpdatedMessage,
} from './handlers/message.handlers';
import { handleInitialStatuses, handleStopTyping, handleTyping, handleUserStatus } from './handlers/user.handlers';
import { WS_IN } from './consts/messageEvents';

export function handleSocketMessage(event: MessageEvent, queryClient: QueryClient) {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (e) {
    console.error('Parse error:', e, event.data);
    return;
  }

  switch (data.type) {
    case WS_IN.NEW_MESSAGE:
      handleNewMessage(data, queryClient);
      break;

    case WS_IN.MESSAGE_UPDATED:
      handleUpdatedMessage(data, queryClient);
      break;

    case WS_IN.MESSAGE_REACTIONS_UPDATED:
      handleReactionUpdated(data, queryClient);
      break;

    case WS_IN.MESSAGE_DELETED:
      handleDeletedMessage(data, queryClient);
      break;

    case WS_IN.INITIAL_STATUSES:
      handleInitialStatuses(data);
      break;

    case WS_IN.STATUS:
      handleUserStatus(data);
      break;

    case WS_IN.NEW_CHAT_CREATED:
      handleChatCreated(data, queryClient);
      break;

    case WS_IN.IS_TYPING:
      handleTyping(data);
      break;

    case WS_IN.STOP_TYPING:
      handleStopTyping(data);
      break;

    case WS_IN.PINNED_MESSAGE: {
      handlePinMessage(data, queryClient);
      break;
    }

    case WS_IN.UNPINNED_MESSAGE: {
      handleUnpinMessage(data, queryClient);
      break;
    }

    default:
      break;
  }
}
