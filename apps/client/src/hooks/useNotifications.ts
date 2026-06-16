import React, { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../lib/firebase';
import api from '../api/api';
import { toast } from 'react-toastify';
import useChatUIStore from '../stores/chatUI';
import { ChatNotificationToast } from '../components/ChatNotificationToast';
import user from '/images/user-no-icon.png';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

interface OpenChatMessage {
  type: 'OPEN_CHAT';
  chatId: number | string;
  messageId: number | string;
}

type ServiceWorkerMessage = OpenChatMessage;

export const useNotifications = ({ scrollToMessage }: { scrollToMessage: (id: number) => void }) => {
  const setCurrentChatId = useChatUIStore((s) => s.setCurrentChatId);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

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
    } catch (err: unknown) {
      console.error('Notification setup failed:', err);
    }
  };

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      if (event.data?.type === 'OPEN_CHAT' && event.data.chatId) {
        const chatId = Number(event.data.chatId);
        const messageId = Number(event.data.messageId);
        if (!Number.isFinite(chatId) || !Number.isFinite(messageId)) return;
        setCurrentChatId(chatId);
        scrollToMessage(messageId);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get('chatId');
    const messageIdFromUrl = urlParams.get('messageId');

    if (chatIdFromUrl) {
      const chatId = Number(chatIdFromUrl);
      const messageId = Number(messageIdFromUrl);
      if (Number.isFinite(chatId) && Number.isFinite(messageId)) {
        setCurrentChatId(chatId);
        scrollToMessage(messageId);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      const isNotCurrentChat = useChatUIStore.getState().currentChatId !== Number(payload?.data?.chatId);

      if (isNotCurrentChat) {
        const toastContent = React.createElement(ChatNotificationToast, {
          onClick: () => {
            setCurrentChatId(Number(payload.data?.chatId));
            toast.dismiss('chat-notification');
          },
          avatar: user,
          title: payload.notification?.title,
          body: payload.notification?.body,
        });

        if (toast.isActive('chat-notification')) {
          toast.update('chat-notification', {
            render: toastContent,
            icon: false,
            autoClose: 5000,
          });
        } else {
          toast.info(toastContent, {
            toastId: 'chat-notification',
            icon: false,
          });
        }
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      unsubscribe();
    };
  }, [scrollToMessage, setCurrentChatId]);

  return { requestPermission };
};
