import { FORM_MODE } from '../utils/consts/formModes';
import { SendHorizonal, Check, Search, Reply } from 'lucide-react';
import { useMessageActions } from './useMessageActions';
import useChatUIStore from '../stores/chatUI';
import useMessageFormStore from '../stores/messageForm';
import { useCallback, useEffect, useRef, useState } from 'react';
import useDebounce from './useDebounce';
import { searchMessagesByChatId } from '../services/chats';
import { useChatSocket } from '../websocket/ChatSocketContext';

interface useMessageFormProps {
  scrollToMessage: (id: number) => void;
}

export function useMessageForm({ scrollToMessage }: useMessageFormProps) {
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const menuForMessage = useChatUIStore((s) => s.menuForMessage);
  const setMenuForMessage = useChatUIStore((s) => s.setMenuForMessage);

  const { formMode, text, setFormMode, setText, setReplyTo } = useMessageFormStore();
  const { sendMessage, typing, updateMessage, deleteMessage } = useChatSocket();
  const [resultCounter, setResultCounter] = useState(0);
  const [results, setResults] = useState<{ id: number }[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const throttledTyping = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback(
    (chatId: number) => {
      if (throttledTyping.current) return;

      typing(chatId);

      throttledTyping.current = setTimeout(() => {
        throttledTyping.current = null;
      }, 2000);
    },
    [typing],
  );

  useEffect(
    () => () => {
      if (throttledTyping.current) clearTimeout(throttledTyping.current);
    },
    [],
  );

  const { handleSearch } = useMessageActions({
    deleteMessage,
  });

  const debouncedSearch = useDebounce(async (value: string) => {
    if (currentChatId) {
      const res = await searchMessagesByChatId(currentChatId, value);
      setResults(res);
      setResultCounter(0);
      if (res.length > 0) scrollToMessage(res[0].id);
    }
  }, 300);

  const navigateResult = (direction: 1 | -1) => {
    if (results.length === 0) return;

    const newCounter = resultCounter + direction;
    const index = ((newCounter % results.length) + results.length) % results.length;
    setResultCounter(newCounter);

    scrollToMessage(results[index].id);
  };

  const handleSend = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    if (text.trim().length <= 0) return;
    switch (formMode) {
      case FORM_MODE.CREATE:
        if (currentChatId) sendMessage(currentChatId, text);
        clearForm();
        textareaRef.current?.focus();
        break;

      case FORM_MODE.SEARCH:
        if (currentChatId) {
          await handleSearch();
        }
        clearForm();
        break;

      case FORM_MODE.EDIT:
        if (!menuForMessage) break;
        if (menuForMessage?.text.trim() === text.trim()) {
          clearForm();
          break;
        }
        updateMessage(menuForMessage.id, { type: 'text', content: text });
        setFormMode('create');
        clearForm();
        break;

      case FORM_MODE.REPLY:
        if (!menuForMessage || !currentChatId) break;

        sendMessage(currentChatId, text, menuForMessage.id);

        clearForm();
        break;

      default:
        setText('');
        break;
    }
  };

  useEffect(() => {
    setFormMode('create');
    setText('');
  }, [currentChatId, setFormMode, setText]);

  async function handleOnChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setText(value);

    if (formMode === FORM_MODE.SEARCH && value.trim().length > 0) {
      debouncedSearch(value);
    } else if (currentChatId) {
      handleTyping(currentChatId);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (!text.trim()) return;

      handleSend(e);
    }
  }

  const clearForm = () => {
    setMenuForMessage(null);
    setFormMode('create');
    setReplyTo(null);
    setText('');
  };

  const formButton = () => {
    switch (formMode) {
      case 'create':
        return <SendHorizonal />;

      case 'search':
        return <Search />;

      case 'edit':
        return <Check />;

      case 'reply':
        return <Reply />;

      default:
        return <SendHorizonal />;
    }
  };
  return {
    resultCounter,
    results,
    textareaRef,
    clearForm,
    handleSend,
    formButton,
    handleKeyDown,
    handleOnChange,
    navigateResult,
  };
}
