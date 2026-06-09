import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  language: string;
  setLanguage: (lang: string) => void;
}

const getBrowserLanguage = () => {
  const lang = navigator.language.split('-')[0];
  const supported = ['en', 'uk'];
  return supported.includes(lang) ? lang : 'en';
};

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      language: getBrowserLanguage(),
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'user-storage' },
  ),
);

export default useUserStore;
