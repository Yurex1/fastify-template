import { Services } from '../services/types';
import { exception } from '../utils/exception/util';
import { CHAT_ACTIONS } from '../services/chat/consts';
import { CALL_ACTIONS } from '../services/livekit/consts';

import { WsServer } from './types';
import { UserResult } from '../entities/user';

interface MessageHandlersDeps {
  services: Services;
  fastifyWs: WsServer;
  uid: number;
  user: UserResult;
}

export const createMessageHandlers = ({ services, fastifyWs, uid, user }: MessageHandlersDeps) => {
  const broadcastStatus = async (uid: number, type: string, payload: {}) => {
    try {
      const peers = await services.chat.getAllMembers(uid);
      for (const peer of peers) {
        fastifyWs.send(peer.userId, { type, payload });
      }
    } catch (e) {
      console.error('Broadcast Status Error:', e);
    }
  };

  const broadcastForChatMembers = async (chatId: number, type: string, payload: {}) => {
    try {
      const peers = await services.chat.getAllMembersByChatId(chatId);
      for (const peer of peers) {
        fastifyWs.send(peer.userId, { type, payload });
      }
    } catch (e) {
      console.error('Broadcast Status Error:', e);
    }
  };

  const handleSendMessage = async (data: any) => {
    const { chatId, text, reply_id } = data.payload;
    const message = await services.chat.sendMessage(uid, chatId, text, reply_id);
    await broadcastForChatMembers(message.chatId, CHAT_ACTIONS.newMessage, message);
  };

  const handleUpdateMessage = async (data: {
    payload: { messageId: number; definition: { content: string; type: 'text' } };
  }) => {
    const { messageId, definition } = data.payload;

    const key = definition.type;
    const updated = await services.chat.updateMessage(messageId, { [key]: definition.content });
    await broadcastForChatMembers(updated.chatId, CHAT_ACTIONS.updatedMessage, updated);
  };

  const handleTyping = async (chatId: number, typingTimers: Map<number, NodeJS.Timeout>) => {
    if (typingTimers.has(uid)) {
      clearTimeout(typingTimers.get(uid)!);
    } else {
      const peers = (await services.chat.getAllMembersByChatId(chatId)).filter((member) => member.userId !== uid);
      for (const peer of peers) {
        fastifyWs.send(peer.userId, {
          type: CHAT_ACTIONS.typing,
          payload: { userName: user.username, chatId, isTyping: false },
        });
      }
    }
    const timer = setTimeout(async () => {
      typingTimers.delete(uid);
      const peers = (await services.chat.getAllMembersByChatId(chatId)).filter((member) => member.userId !== uid);
      for (const peer of peers) {
        fastifyWs.send(peer.userId, {
          type: CHAT_ACTIONS.stopTyping,
          payload: { userName: user.username, chatId, isTyping: false },
        });
      }
    }, 500);
    typingTimers.set(uid, timer);
  };

  const handleUpdateReaction = async (data: { payload: { id: number; userId: number; reaction: string } }) => {
    const { id, userId, reaction } = data.payload;
    try {
      const updatedMessage = await services.chat.updateReactions(id, userId, reaction);
      if (!updatedMessage) throw exception.notFound('NOT_FOUND_A_MESSAGE');
      const memberIds = await services.chat.getAllMembersByChatId(updatedMessage.chatId);
      memberIds.forEach((member) =>
        fastifyWs.send(member.userId, {
          type: CHAT_ACTIONS.updatedReaction,
          payload: { id: updatedMessage.id, reactions: updatedMessage.reactions },
        }),
      );
    } catch (err: unknown) {
      if (err instanceof Error) fastifyWs.send(uid, { type: 'ERROR', payload: { message: err.message } });
    }
  };

  const handleCreateRoom = async (data: { payload: { chatId: number; roomName: string } }) => {
    const { chatId, roomName } = data.payload;
    await broadcastForChatMembers(chatId, CALL_ACTIONS.incoming, { chatId, roomName });
  };

  const handleDeleteMessage = async (data: { payload: { messageId: number } }) => {
    const { messageId } = data.payload;
    const msg = await services.chat.findMessage({ id: messageId });
    if (!msg) throw new Error('NOT_FOUND');
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
