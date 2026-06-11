import { FORM_MODE } from '../utils/consts/formModes';
import { SendHorizonal, Check, Search, Reply } from 'lucide-react';
import { useMessageActions } from './useMessageActions';
import useChatUIStore from '../stores/chatUI';
import useMessageFormStore from '../stores/messageForm';
import { useEffect, useRef, useState } from 'react';
import useDebounce from './useDebounce';
import { searchMessagesByChatId } from '../services/chats';
import { useChatSocket } from '../websocket/ChatSocketContext';

interface useMessageFormProps {
  scrollToMessage: (id: number) => void;
}

export function useMessageForm({ scrollToMessage }: useMessageFormProps) {
  const { sendMessage, typing, updateMessage, deleteMessage } = useChatSocket();
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const anchorMessageId = useChatUIStore((s) => s.anchorMessageId);
  const setAnchorMessageId = useChatUIStore((s) => s.setAnchorMessageId);

  const { formMode, text, setFormMode, setText, setReplyTo } = useMessageFormStore();
  const [resultCounter, setResultCounter] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedTyping = useDebounce((chatId: number) => {
    typing(chatId);
  }, 500);

  const [results, setResults] = useState<{ id: number }[]>([]);

  const debouncedSearch = useDebounce(async (value: string) => {
    if (currentChatId) {
      const res = await searchMessagesByChatId(currentChatId, value);
      setResults(res);
      setResultCounter(0);
      if (res.length > 0) scrollToMessage(res[0].id);
    }
  }, 300);

  const navigateResult = (direction: 1 | -1) => {
    const newCounter = resultCounter + direction;
    const index = ((newCounter % results.length) + results.length) % results.length;
    setResultCounter(newCounter);

    const targetId = results[index].id;

    if (anchorMessageId !== null && anchorMessageId !== targetId) {
      setAnchorMessageId(null);

      setTimeout(() => scrollToMessage(targetId), 50);
    } else {
      scrollToMessage(targetId);
    }
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
        if (!messageToEdit) break;
        if (messageToEdit?.text.trim() === text.trim()) {
          clearForm();
          break;
        }
        updateMessage(messageToEdit.id, { type: 'text', content: text });
        setFormMode('create');
        clearForm();
        break;

      case FORM_MODE.REPLY:
        if (!messageToEdit || !currentChatId) break;

        sendMessage(currentChatId, text, messageToEdit.id);

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
      debouncedTyping(currentChatId);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (!text.trim()) return;

      handleSend(e);
    }
  }
  const { handleSearch } = useMessageActions({
    deleteMessage,
  });

  const messageToEdit = useChatUIStore((s) => s.menuForMessage);
  const setMessageToEdit = useChatUIStore((s) => s.setMenuForMessage);

  const clearForm = () => {
    setMessageToEdit(null);
    setFormMode('create');
    setReplyTo(null);
    setText('');
    return;
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
        break;
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
