import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import { CHAT_TYPES } from '../../utils/consts/chatTypes';
import { QueryKeys } from '../../lib/queries';
import type { Chat, ChatList, ChatPageParam } from '../../api/chats/types';

type UpdateChatsParams =
  | { type: typeof CHAT_TYPES.created; chatId?: number; data: Chat }
  | { type: typeof CHAT_TYPES.update; chatId: number; data: Partial<Chat> }
  | { type: typeof CHAT_TYPES.delete; chatId: number; data: number };

interface UpdateChatsCacheProps {
  queryClient: QueryClient;
  payload: UpdateChatsParams;
}

export const updateChatsCache = ({ queryClient, payload }: UpdateChatsCacheProps) => {
  queryClient.setQueryData<InfiniteData<ChatList, ChatPageParam>>([QueryKeys.chats], (old) => {
    if (!old) return undefined;

    const newPages = [...old.pages];

    switch (payload.type) {
      case CHAT_TYPES.created: {
        const chat = payload.data as Chat;
        newPages[0] = {
          ...newPages[0],
          chats: [chat, ...newPages[0].chats],
        };
        break;
      }

      case CHAT_TYPES.update: {
        const { chatId } = payload;
        const updateData = payload.data as Partial<Chat>;
        const newUpdatedAt = updateData.updatedAt || new Date().toISOString();
        let updatedChat: Chat | null = null;

        newPages.forEach((page, pageIndex) => {
          const chatIndex = page.chats.findIndex((c) => c?.id === chatId);
          if (chatIndex !== -1) {
            updatedChat = { ...page.chats[chatIndex], ...updateData, updatedAt: newUpdatedAt };
            newPages[pageIndex] = {
              ...page,
              chats: page.chats.filter((c) => c.id !== chatId),
            };
          }
        });

        if (updatedChat) {
          newPages[0] = {
            ...newPages[0],
            chats: [updatedChat, ...newPages[0].chats],
          };
        }
        break;
      }

      case CHAT_TYPES.delete: {
        const targetChatId = payload.data;
        newPages.forEach((page, pageIndex) => {
          newPages[pageIndex] = {
            ...page,
            chats: page.chats.filter((c) => c.id !== targetChatId),
          };
        });
        break;
      }
    }

    return { ...old, pages: newPages };
  });
};
