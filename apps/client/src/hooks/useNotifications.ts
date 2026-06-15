import React, { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../lib/firebase';
import api from '../api/api';
import { toast } from 'react-toastify';
import useChatUIStore from '../stores/chatUI';
import { ChatNotificationToast } from '../components/ChatNotificationToast';
import user from '/images/user-no-icon.png';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const useNotifications = ({ scrollToMessage }: { scrollToMessage: (id: number) => void }) => {
  const setCurrentChatId = useChatUIStore((s) => s.setCurrentChatId);

  const requestPermission = async () => {
    console.log('Requesting notification permission...');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      let reg = registrations.find((r) => r.active?.scriptURL.includes('firebase-messaging-sw.js'));

      if (!reg) {
        reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: reg,
      });

      if (token) {
        await api.post('deviceToken/register', {
          json: { token },
        });
      }
    } catch (err: any) {
      console.error('Notification setup failed:', err);
    }
  };

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OPEN_CHAT' && event.data.chatId) {
        setCurrentChatId(Number(event.data.chatId));
        scrollToMessage(event.data.messageId);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get('chatId');
    const messageIdFromUrl = urlParams.get('messageId');

    if (chatIdFromUrl) {
      setCurrentChatId(Number(chatIdFromUrl));
      scrollToMessage(Number(messageIdFromUrl));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload);

      const isNotCurrentChat = useChatUIStore.getState().currentChatId !== Number(payload?.data?.chatId);

      if (isNotCurrentChat) {
        toast.info(
          React.createElement(ChatNotificationToast, {
            // avatar: payload.data?.avatar,
            onClick: () => setCurrentChatId(Number(payload.data?.chatId)),
            avatar: user,
            title: payload.notification?.title,
            body: payload.notification?.body,
          }),
        );
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      unsubscribe();
    };
  }, []);

  return { requestPermission };
};
