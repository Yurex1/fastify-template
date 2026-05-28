import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FormMode, Message } from '../api/chats/types';

interface useMessageFormProps {
  formMode: FormMode;
  text: string;
  replyTo: Message | null;

  setFormMode: (mode: FormMode) => void;
  setText: (text: string) => void;
  setReplyTo: (message: Message | null) => void;
}

const useMessageFormStore = create<useMessageFormProps>()(
  persist(
    (set) => ({
      formMode: 'create',
      text: '',
      replyTo: null,

      setFormMode: (formMode) => set({ formMode }),
      setText: (text) => set({ text }),
      setReplyTo: (replyTo) => set({ replyTo }),
    }),
    { name: 'message-form-storage' },
  ),
);

export default useMessageFormStore;
