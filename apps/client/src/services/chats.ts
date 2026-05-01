import chatsApi from '../api/chats/chats';
import { clearLastChatId } from '../utils/lastOpenChatId';
import { toast } from 'react-toastify';
interface fetchChats {
  page?: number;
  limit?: number;
}
export async function fetchChats({ page, limit }: fetchChats) {
  try {
    const response = await chatsApi.getChatList(page, limit);
    return response;
  } catch (error) {
    toast.error('Failed to fetch chats');
    return [];
  }
}

export async function createChat(memberId: number) {
  if (!memberId) return;

  try {
    const response = await chatsApi.createChat(memberId);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('404')) toast.error('There is no user with this ID');
      if (error.message.includes('400')) toast.error('Chat with this user already exists');
    }
    return;
  }
}

export async function deleteChat(chatId: number) {
  try {
    const response = await chatsApi.removeChat(chatId);
    clearLastChatId();
    return response;
  } catch (error) {
    toast.error('Failed to delete the chat');
    return [];
  }
}
