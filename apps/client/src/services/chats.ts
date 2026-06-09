import chatsApi from '../api/chats/chats';
import useChatUIStore from '../stores/chatUI';
import { clearLastChatId } from '../utils/lastOpenChatId';
import { toast } from 'react-toastify';
import i18n from '../i18next';

export async function fetchChats() {
  try {
    return await chatsApi.getChatList();
  } catch (error) {
    toast.error(i18n.t('errors.fetchChats'));
    return [];
  }
}

export async function searchMessagesByChatId(chatId: number, text: string) {
  try {
    return await chatsApi.searchMessagesByChatId(chatId, text);
  } catch (error) {
    toast.error(i18n.t('errors.searchMessage'));
    return [];
  }
}

export async function createChat(memberId: number) {
  if (!memberId) return;

  try {
    return await chatsApi.createChat(memberId);
  } catch (error) {
    const message = (error as any)?.message;
    toast.error(message ?? i18n.t('errors.createChat'));
  }
}

export async function deleteChat(chatId: number) {
  try {
    const response = await chatsApi.removeChat(chatId);
    clearLastChatId();
    useChatUIStore.getState().reset();
    return response;
  } catch (error) {
    toast.error(i18n.t('errors.deleteChat'));
    return [];
  }
}
