importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyAk0QijNn0St6r3Fj4-_ukcvdYSv3GWAyY',
  authDomain: 'fastify-template-ae163.firebaseapp.com',
  projectId: 'fastify-template-ae163',
  storageBucket: 'fastify-template-ae163.firebasestorage.app',
  messagingSenderId: '345513828754',
  appId: '1:345513828754:web:1a4dae6f0dc8f99ab0a14b',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'New message';
  const body = payload.notification?.body || payload.data?.body || payload.data?.text || '';

  self.registration.showNotification(title, {
    body,
    icon: '/images/user-no-icon',
    badge: '/images/user-no-icon',
    data: payload.data || {},
    vibrate: [100, 50, 100],
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const chatId = event.notification.data?.chatId;
  const messageId = event.notification.data?.messageId;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      const client = clientsList.find((c) => new URL(c.url).origin === self.location.origin);

      if (client) {
        client.postMessage({
          type: 'OPEN_CHAT',
          chatId: chatId,
          messageId: messageId,
        });

        return client.focus();
      }

      if (chatId) {
        return clients.openWindow(`/?chatId=${chatId}&messageId=${messageId}`);
      }
      return clients.openWindow('/');
    }),
  );
});
