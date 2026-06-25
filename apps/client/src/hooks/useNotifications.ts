import React, { useEffect, useState } from 'react';
import { getToken, deleteToken, onMessage, type Messaging } from 'firebase/messaging';
import { getFirebaseConfig, getMessagingInstance, type ServerFirebaseConfig } from '../lib/firebase';
import api from '../api/api';
import { toast } from 'react-toastify';
import useChatUIStore from '../stores/chatUI';
import { ChatNotificationToast } from '../components/ChatNotificationToast';
import user from '/images/user-no-icon.png';
import { buildSwUrl, SW_PATH } from '../utils/buildSwUrl';

const NOTIF_STORAGE_KEY = 'notificationsEnabled';

interface OpenChatMessage {
  type: 'OPEN_CHAT';
  chatId: number | string;
  messageId: number | string;
}

type ServiceWorkerMessage = OpenChatMessage;

const registerMessagingSw = async (cfg: ServerFirebaseConfig): Promise<ServiceWorkerRegistration> => {
  const swUrl = buildSwUrl(cfg);
  const registrations = await navigator.serviceWorker.getRegistrations();
  const existing = registrations.find((r) => {
    const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '';
    return url.includes(SW_PATH);
  });

  if (existing) {
    const activeUrl = existing.active?.scriptURL || '';
    if (activeUrl === swUrl) return existing;
    await existing.unregister();
  }

  const reg = await navigator.serviceWorker.register(swUrl);
  await navigator.serviceWorker.ready;
  return reg;
};

const getExistingSwRegistration = async (): Promise<ServiceWorkerRegistration | undefined> => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.find((r) => {
    const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '';
    return url.includes(SW_PATH);
  });
};

export const useNotifications = ({ scrollToMessage }: { scrollToMessage?: (id: number) => void }) => {
  const setCurrentChatId = useChatUIStore((s) => s.setCurrentChatId);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => Notification.permission === 'granted' && localStorage.getItem(NOTIF_STORAGE_KEY) === 'true',
  );
  const [messaging, setMessaging] = useState<Messaging | null>(null);

  useEffect(() => {
    getMessagingInstance()
      .then(setMessaging)
      .catch((err) => console.error('Failed to init Firebase messaging:', err));
  }, []);

  const requestPermission = async () => {
    if (!messaging) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotificationsEnabled(false);
        return;
      }

      const cfg = await getFirebaseConfig();
      const reg = await registerMessagingSw(cfg);

      const token = await getToken(messaging, {
        vapidKey: cfg.vapidKey,
        serviceWorkerRegistration: reg,
      });

      if (token) {
        await api.post('deviceToken/register', { json: { token } });
        localStorage.setItem(NOTIF_STORAGE_KEY, 'true');
        setNotificationsEnabled(true);
      }
    } catch (err: unknown) {
      console.error('Notification setup failed:', err);
      setNotificationsEnabled(false);
    }
  };

  const disableNotifications = async () => {
    if (!messaging) return;

    try {
      const cfg = await getFirebaseConfig();
      const reg = await getExistingSwRegistration();
      const token = await getToken(messaging, {
        vapidKey: cfg.vapidKey,
        ...(reg ? { serviceWorkerRegistration: reg } : {}),
      });
      if (token) {
        await api.post('deviceToken/unregister', { json: { token } });
        await deleteToken(messaging);
      }
    } catch (err) {
      console.error('Failed to disable notifications:', err);
    } finally {
      localStorage.removeItem(NOTIF_STORAGE_KEY);
      setNotificationsEnabled(false);
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      disableNotifications();
    } else {
      requestPermission();
    }
  };

  useEffect(() => {
    if (!messaging) return;

    const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      if (event.data?.type === 'OPEN_CHAT' && event.data.chatId) {
        const chatId = Number(event.data.chatId);
        const messageId = Number(event.data.messageId);
        if (!Number.isFinite(chatId) || !Number.isFinite(messageId)) return;
        setCurrentChatId(chatId);
        scrollToMessage?.(messageId);
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
        scrollToMessage?.(messageId);
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
  }, [messaging, scrollToMessage, setCurrentChatId]);

  return { requestPermission, disableNotifications, toggleNotifications, notificationsEnabled };
};
