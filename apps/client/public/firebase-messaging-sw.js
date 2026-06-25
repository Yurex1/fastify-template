importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

const fetchFirebaseConfig = async () => {
  try {
    const configsResponse = await fetch('http://localhost:9000/deviceToken/firebase-configs');
    if (!configsResponse.ok) {
      throw new Error('Failed to fetch Firebase configuration');
    }
    console.log('Firebase configs received');
    const data = await configsResponse.json();
    return data.firebaseConfigs || data;
  } catch (error) {
    console.error('Error loading the Firebase config:', error);
    throw error;
  }
};

let messaging;

const initFirebase = async () => {
  const firebaseConfig = await fetchFirebaseConfig();
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
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
};

initFirebase();

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
