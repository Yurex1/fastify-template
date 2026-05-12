import { toast } from 'react-toastify';
import useMessageFormStore from '../stores/messageForm';
import useChatUIStore from '../stores/chatUI';
import { searchMessagesByChatId } from '../services/chats';
import chatsApi from '../api/chats/chats';
import { useState } from 'react';

interface useMessageActionsProps {
  deleteMessage: (messageId: number) => void;
  fetchNextPage?: () => Promise<unknown>;
  loadedPages?: number;
}

export function useMessageActions({ deleteMessage, fetchNextPage, loadedPages }: useMessageActionsProps) {
  const { formMode, setFormMode, text, setText, replyTo, setReplyTo } = useMessageFormStore();
  const [isFetching, setIsFetching] = useState(false);
  const menuForMessage = useChatUIStore((s) => s.menuForMessage);
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const handleSearch = async () => {
    const res = await searchMessagesByChatId(currentChatId, text);
    return res;
  };

  const scrollToMessage = async (messageId: number) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const { page } = await chatsApi.getMessagePage(currentChatId, messageId);
    const pagesToLoad = page - loadedPages;
    setIsFetching(true);

    for (let i = 0; i < pagesToLoad; i++) {
      await fetchNextPage();
    }

    setTimeout(() => {
      const el = document.getElementById(`message-${messageId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsFetching(false);
    }, 100);
  };

  const handleEdit = () => {
    if (menuForMessage) {
      setFormMode('edit');
      setText(menuForMessage.text);
    }
  };

  const handleCopy = () => {
    if (menuForMessage?.text) {
      navigator.clipboard.writeText(menuForMessage.text);
      toast.success('Text copied');
    }
  };

  const handleReply = () => {
    if (menuForMessage) {
      setFormMode('reply');
      setReplyTo(menuForMessage);
    }
  };

  const handleDelete = () => {
    if (menuForMessage) {
      deleteMessage(menuForMessage.id);
    }
  };

  return {
    formMode,
    replyTo,
    text,
    isFetching,
    setText,
    setFormMode,
    setReplyTo,
    handleSearch,
    handleEdit,
    handleCopy,
    handleReply,
    handleDelete,
    scrollToMessage,
  };
}
