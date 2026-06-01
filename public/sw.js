// public/sw.js - Service Worker for Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'NewsHaberGlobal', body: event.data.text() };
  }

  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Haberi Oku' },
      { action: 'close', title: 'Kapat' },
    ],
    tag: data.tag || 'news-notification',
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title || 'NewsHaberGlobal', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
    }).then((newSubscription) => {
      // Send new subscription to server
      return fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'browser',
          endpoint: newSubscription.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('auth')))),
        }),
      });
    })
  );
});
