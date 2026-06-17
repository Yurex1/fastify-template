import { Services } from '../services/types';
import { exception } from '../utils/exception/util';
import { CHAT_ACTIONS } from '../services/chat/consts';
import { CALL_ACTIONS } from '../services/livekit/consts';

import { WsServer } from './types';
import { UserResult } from '../entities/user';

import type {
  WithPayload,
  SendMessagePayload,
  UpdateMessagePayload,
  UpdateReactionPayload,
  DeleteMessagePayload,
  CreateRoomPayload,
} from './validation';
interface MessageHandlersDeps {
  services: Services;
  fastifyWs: WsServer;
  uid: number;
  user: UserResult;
}

const BROADCAST_MODES = {
  OTHERS: 'others',
  ALL: 'all',
};

export const createMessageHandlers = ({ services, fastifyWs, uid, user }: MessageHandlersDeps) => {
  const broadcastStatus = async (uid: number, type: string, payload: Record<string, unknown>) => {
    try {
      const peers = await services.chat.getAllMembers(uid);
      for (const peer of peers) {
        fastifyWs.send(peer.userId, { type, payload });
      }
    } catch (e) {
      console.error('Broadcast Status Error:', e);
    }
  };

  const broadcastForChatMembers = async (chatId: number, type: string, payload: {}, mode?: 'all' | 'others') => {
    try {
      const allMembers = await services.chat.getAllMembersByChatId(chatId);
      const peers = mode === BROADCAST_MODES.OTHERS ? allMembers.filter((member) => member.userId !== uid) : allMembers;
      for (const peer of peers) {
        fastifyWs.send(peer.userId, { type, payload });
      }
    } catch (e) {
      console.error('Broadcast Status Error:', e);
    }
  };

  const handleSendMessage = async (data: WithPayload<SendMessagePayload>) => {
    const { chatId, text, reply_id } = data.payload;

    const message = await services.chat.sendMessage(uid, chatId, text.trim(), reply_id ?? undefined);
    await broadcastForChatMembers(message.chatId, CHAT_ACTIONS.newMessage, message);
  };

  const handleUpdateMessage = async (data: WithPayload<UpdateMessagePayload>) => {
    const { messageId, definition } = data.payload;

    const existing = await services.chat.findMessage({ id: messageId });
    if (!existing) throw exception.notFound('MESSAGE_NOT_FOUND');
    if (existing.userId !== uid) throw exception.forbidden('NOT_YOUR_MESSAGE');

    if (definition.type !== 'text') throw exception.badRequest('INVALID_DEFINITION_TYPE');

    const key = definition.type;
    const updated = await services.chat.updateMessage(messageId, { [key]: definition.content });
    await broadcastForChatMembers(updated.chatId, CHAT_ACTIONS.updatedMessage, updated);
  };

  const handleTyping = async (chatId: number, typingTimers: Map<number, NodeJS.Timeout>) => {
    await broadcastForChatMembers(chatId, CHAT_ACTIONS.typing, { userName: user.username, chatId }, 'others');

    if (typingTimers.has(uid)) {
      clearTimeout(typingTimers.get(uid));
    }

    const timer = setTimeout(async () => {
      typingTimers.delete(uid);
      await broadcastForChatMembers(chatId, CHAT_ACTIONS.stopTyping, { userName: user.username, chatId }, 'others');
    }, 3000);

    typingTimers.set(uid, timer);
  };

  const handleUpdateReaction = async (data: WithPayload<UpdateReactionPayload>) => {
    const { id, reaction, chatId } = data.payload;
    const updatedMessage = await services.chat.updateReactions(id, uid, reaction);
    if (!updatedMessage) throw exception.notFound('NOT_FOUND_A_MESSAGE');
    const memberIds = await services.chat.getAllMembersByChatId(updatedMessage.chatId);
    memberIds.forEach((member) =>
      fastifyWs.send(member.userId, {
        type: CHAT_ACTIONS.updatedReaction,
        payload: { id: updatedMessage.id, reactions: updatedMessage.reactions, chatId },
      }),
    );
  };

  const handleCreateRoom = async (data: WithPayload<CreateRoomPayload>) => {
    const { chatId, roomName, chatName } = data.payload;
    await broadcastForChatMembers(chatId, CALL_ACTIONS.incoming, { chatId, roomName, chatName }, 'others');
  };

  const handleDeleteMessage = async (data: WithPayload<DeleteMessagePayload>) => {
    const { messageId } = data.payload;
    const msg = await services.chat.findMessage({ id: messageId });
    if (!msg) throw exception.notFound('NOT_FOUND');

    if (msg.userId !== uid) throw exception.forbidden('NOT_YOUR_MESSAGE');
    await services.chat.removeMessage(messageId);
    await broadcastForChatMembers(msg.chatId, CHAT_ACTIONS.deletedMessage, { messageId, chatId: msg.chatId });
    await broadcastForChatMembers(msg.chatId, CHAT_ACTIONS.unpinnedMessage, { messageId, chatId: msg.chatId });
  };

  const handleInitialStatuses = async () => {
    try {
      const peers = await services.chat.getAllMembers(uid);

      const initialStatuses = peers
        .filter((peer) => fastifyWs.hasConnection(peer.userId))
        .map((peer) => ({
          userId: peer.userId,
          isOnline: true,
        }));

      if (initialStatuses.length > 0) {
        fastifyWs.send(uid, {
          type: CHAT_ACTIONS.initialState,
          payload: initialStatuses,
        });
      }
    } catch (e) {
      console.error('Failed to send initial statuses:', e);
    }
  };

  return {
    handleSendMessage,
    handleUpdateMessage,
    handleTyping,
    handleUpdateReaction,
    handleDeleteMessage,
    handleInitialStatuses,
    handleCreateRoom,
    broadcastStatus,
  };
};
