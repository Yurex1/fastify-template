import chatsApi from '../api/chats/chats';
import useChatUIStore from '../stores/chatUI';
import { clearLastChatId } from '../utils/lastOpenChatId';
import { toast } from 'react-toastify';
import i18n from '../i18next';

export async function fetchChats() {
  try {
    return await chatsApi.getChatList();
  } catch {
    toast.error(i18n.t('errors.fetchChats'));
    return [];
  }
}

export async function searchMessagesByChatId(chatId: number, text: string) {
  try {
    return await chatsApi.searchMessagesByChatId(chatId, text);
  } catch {
    toast.error(i18n.t('errors.searchMessage'));
    return [];
  }
}

export async function createChat(memberId: number) {
  if (!memberId) return;

  try {
    return await chatsApi.createChat(memberId);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const message = error?.message;
      console.log(message);
      toast.error(i18n.t(`chat.errors.${message.toLowerCase()}`));
    }
  }
}

export async function deleteChat(chatId: number) {
  try {
    const response = await chatsApi.removeChat(chatId);
    clearLastChatId();
    useChatUIStore.getState().reset();
    return response;
  } catch {
    toast.error(i18n.t('errors.deleteChat'));
    return [];
  }
}
