import { toast } from 'react-toastify';
import useMessageFormStore from '../stores/messageForm';
import useChatUIStore from '../stores/chatUI';
import { searchMessagesByChatId } from '../services/chats';

interface useMessageActionsProps {
  deleteMessage: (messageId: number) => void;
}

export function useMessageActions({ deleteMessage }: useMessageActionsProps) {
  const { setFormMode, text, setText, setReplyTo } = useMessageFormStore();

  const menuForMessage = useChatUIStore((s) => s.menuForMessage);
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const handleSearch = async () => {
    const res = await searchMessagesByChatId(currentChatId, text);
    return res;
  };

  // const scrollToMessage = async (messageId: number) => {
  //   const applyHighlight = (element: HTMLElement) => {
  //     element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     element.classList.add('highlight-message');

  //     setTimeout(() => {
  //       element.classList.remove('highlight-message');
  //     }, 2000);
  //   };

  //   const el = document.getElementById(`message-${messageId}`);

  //   if (el) {
  //     applyHighlight(el);
  //     return;
  //   }

  //   try {
  //     setIsFetching(true);
  //     const { page } = await chatsApi.getMessagePage(currentChatId, messageId);

  //     const pagesToLoad = page - loadedPages;

  //     if (pagesToLoad > 0) {
  //       for (let i = 0; i < pagesToLoad; i++) {
  //         await fetchNextPage();
  //       }
  //     }

  //     setTimeout(() => {
  //       const newEl = document.getElementById(`message-${messageId}`);
  //       if (newEl) {
  //         applyHighlight(newEl);
  //       }
  //       setIsFetching(false);
  //     }, 300);
  //   } catch (error) {
  //     console.error('Failed to jump to message:', error);
  //     setIsFetching(false);
  //   }
  // };

  // scrollToMessage в useMessageActions больше не нужен — логика переехала в MessageWindow.
  // Если где-то в других компонентах нужен scrollToMessage без прыжка — оставь только DOM-часть:
  const highlightMessage = (el: HTMLElement) => {
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
    el.classList.add('highlight-message');
    setTimeout(() => el.classList.remove('highlight-message'), 2000);
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
    handleSearch,
    handleEdit,
    handleCopy,
    handleReply,
    handleDelete,
    highlightMessage,
  };
}
