import { Services } from '../services/types';
import { exception } from '../utils/exception/util';
import { CHAT_ACTIONS } from '../services/chat/consts';
import { WsServer } from './types';
import { User } from '../entities/user';

interface MessageHandlersDeps {
  services: Services;
  fastifyWs: WsServer;
  uid: number;
  user: User;
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

  const handleSendMessage = async (data: any) => {
    const { chatId, text, reply_id } = data.payload;
    await broadcastStatus(uid, 'STOP_TYPING', { userId: uid, isTyping: false });
    const message = await services.chat.sendMessage(uid, chatId, text, reply_id);
    const members = await services.chat.getAllMembersByChatId(chatId);
    members.forEach((m) => fastifyWs.send(m.userId, { type: CHAT_ACTIONS.newMessage, payload: message }));
  };

  const handleUpdateMessage = async (data: {
    payload: { messageId: number; definition: { content: string; type: string } };
  }) => {
    const { messageId, definition } = data.payload;
    await broadcastStatus(uid, 'STOP_TYPING', { userId: uid, isTyping: false });
    const key = definition.type;
    const updated = await services.chat.updateMessage(messageId, { [key]: definition.content });
    const members = await services.chat.getAllMembersByChatId(updated.chatId);
    members.forEach((m) => fastifyWs.send(m.userId, { type: CHAT_ACTIONS.updatedMessage, payload: updated }));
  };

  const handleTyping = async (typingTimers: Map<number, NodeJS.Timeout>) => {
    if (typingTimers.has(uid)) {
      clearTimeout(typingTimers.get(uid)!);
    } else {
      await broadcastStatus(uid, 'IS_TYPING', { userName: user.username, isTyping: true });
    }
    const timer = setTimeout(async () => {
      typingTimers.delete(uid);
      await broadcastStatus(uid, 'STOP_TYPING', { userId: uid, isTyping: false });
    }, 3000);
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

  const handleDeleteMessage = async (data: { payload: { messageId: number } }) => {
    const { messageId } = data.payload;
    const msg = await services.chat.findMessage({ id: messageId });
    if (!msg) throw new Error('NOT_FOUND');
    await services.chat.removeMessage(messageId);
    const members = await services.chat.getAllMembersByChatId(msg.chatId);
    members.forEach((m) =>
      fastifyWs.send(m.userId, {
        type: CHAT_ACTIONS.deletedMessage,
        payload: { messageId, chatId: msg.chatId },
      }),
    );

    members.forEach((m) =>
      fastifyWs.send(m.userId, {
        type: CHAT_ACTIONS.unpinedMessage,
        payload: { messageId, chatId: msg.chatId },
      }),
    );
  };

  const handleGetStatus = async (data: { payload: { userId: number; isActive: boolean } }) => {
    const { userId, isActive } = data.payload;
    try {
      const memberIds = await services.chat.getAllMembers(userId);
      memberIds.forEach((member) =>
        fastifyWs.send(member.userId, {
          type: CHAT_ACTIONS.sendStatus,
          payload: { userId, isActive },
        }),
      );
    } catch (err: unknown) {
      if (err instanceof Error) fastifyWs.send(uid, { type: 'ERROR', payload: { message: err.message } });
    }
  };

  return {
    handleSendMessage,
    handleUpdateMessage,
    handleTyping,
    handleUpdateReaction,
    handleDeleteMessage,
    handleGetStatus,
    broadcastStatus,
  };
};
