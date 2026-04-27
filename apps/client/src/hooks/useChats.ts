import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import type { Chat, Payload } from '../api/types';
import { USER_TYPES } from '../utils/consts/userTypes';
import { CHAT_TYPES } from '../utils/consts/chatTypes';

interface useChatsProps {
  currentChatId: number | null;
}

export function useChats({ currentChatId }: useChatsProps) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: [QueryKeys.chats],
    queryFn: ({ pageParam = 1 }) => chatsApi.getChatList(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length < 20 ? undefined : allPages.length + 1),
    enabled: !!currentChatId,
    staleTime: Infinity,
  });

  const updateChatsCache = (type: string, chatId: number, data: Payload) => {
    queryClient.setQueryData<InfiniteData<Chat[]>>([QueryKeys.chats], (old) => {
      if (!old) return old;

      if (type === CHAT_TYPES.update) {
        let targetChat: Chat | null = null;

        const updatedPages = old.pages.map((page) => {
          const found = page.find((c) => c.id === chatId);
          if (found) {
            targetChat = { ...found, updatedAt: data.createdAt };
            return page.filter((c) => c.id !== chatId);
          }
          return page;
        });

        if (targetChat) {
          const newPages = [...updatedPages];
          newPages[0] = [targetChat, ...newPages[0]];

          return {
            ...old,
            pages: newPages,
          };
        }

        return old;
      }

      if (type === CHAT_TYPES.delete) {
        // update the updatedAt field of the Chat to the time
        // the last message was created and if there are no messages,
        // use the chat's createdAt date
      }

      // if (type === CHAT_TYPES.create) {
      // add new chat on the top and make it currentChat
      // }

      if (type === USER_TYPES.getInitialStatus) {
        queryClient.setQueriesData<InfiniteData<Chat[]>>({ queryKey: [QueryKeys.chats] }, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((chat) => {
                const updatedMembers = chat.members.map((member) => ({
                  ...member,

                  isOnline: data.onlineIds.includes(member.userId) ? true : member.isOnline,
                }));

                return { ...chat, members: updatedMembers };
              }),
            ),
          };
        });
      }

      if (type === USER_TYPES.getStatus) {
        const { userId, isActive, lastSeen } = data;
        queryClient.setQueriesData<InfiniteData<Chat[]>>({ queryKey: [QueryKeys.chats] }, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((chat) => {
                const updatedMembers = chat.members.map((member) =>
                  member.userId === userId ? { ...member, isOnline: isActive, lastSeen } : member,
                );
                return { ...chat, members: updatedMembers };
              }),
            ),
          };
        });
      }
    });
  };
  return { ...query, updateChatsCache };
}
