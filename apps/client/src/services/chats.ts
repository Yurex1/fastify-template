import chatsApi from '../api/chats/chats';
import useChatUIStore from '../stores/chatUI';
import { clearLastChatId } from '../utils/lastOpenChatId';
import { toast } from 'react-toastify';

export async function fetchChats() {
  try {
    return await chatsApi.getChatList();
  } catch (error) {
    toast.error('Failed to fetch chats');
    return [];
  }
}

export async function searchMessagesByChatId(chatId: number, text: string) {
  try {
    return await chatsApi.searchMessagesByChatId(chatId, text);
  } catch (error) {
    toast.error('Failed to search message');
    return [];
  }
}

export async function createChat(memberId: number) {
  if (!memberId) return;

  try {
    return await chatsApi.createChat(memberId);
  } catch (error) {
    const status = (error as any)?.status;
    const message = (error as any)?.message;

    if (status === 404) toast.error('There is no user with this ID');
    else if (status === 400) toast.error('Chat with this user already exists');
    else toast.error(message ?? 'Failed to create chat');
  }
}

export async function deleteChat(chatId: number) {
  try {
    const response = await chatsApi.removeChat(chatId);
    clearLastChatId();
    useChatUIStore.getState().reset();
    return response;
  } catch (error) {
    toast.error('Failed to delete the chat');
    return [];
  }
}
