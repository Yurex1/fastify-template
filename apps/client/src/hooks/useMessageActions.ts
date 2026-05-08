import type { Message } from '../api/types';
import useUserStore from '../stores/user';
import { toast } from 'react-toastify';

interface useMessageActionsProps {
  messages: Message[];
  deleteMessage: (messageId: number) => void;
}

export function useMessageActions({ messages, deleteMessage }: useMessageActionsProps) {
  const { formMode, setFormMode, text, setText, replyTo, setReplyTo, menuForMessage } = useUserStore();

  const handleSearch = () => {
    const mes = messages.filter((message) => message.text.includes(text));
    console.log(mes);
    // remove later
  };

  const handleEdit = () => {
    if (menuForMessage) {
      setFormMode('edit');
      setText(menuForMessage.text);
      console.log(formMode);
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
    setText,
    setFormMode,
    setReplyTo,
    handleSearch,
    handleEdit,
    handleCopy,
    handleReply,
    handleDelete,
  };
}
