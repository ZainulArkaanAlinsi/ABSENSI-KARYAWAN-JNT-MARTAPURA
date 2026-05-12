// firebase-messaging-sw.js
// Service Worker untuk menerima push notification di background (tab tertutup/tersembunyi)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyD8_xQ095GsDSOr_nhONflsPa0qtMnWfkY',
  authDomain: 'admin-absensi-jne-mtp.firebaseapp.com',
  projectId: 'admin-absensi-jne-mtp',
  storageBucket: 'admin-absensi-jne-mtp.firebasestorage.app',
  messagingSenderId: '586449872388',
  appId: '1:586449872388:web:e72ef8330d71be35ce3751',
});

const messaging = firebase.messaging();

// Background message handler — aktif saat tab ditutup / browser minimize
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'JNE Martapura';
  const body = payload.notification?.body || 'Ada notifikasi baru untuk Anda.';
  const data = payload.data || {};

  const notifOptions = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200, 100, 200],
    data,
    tag: 'jne-admin-' + (data.type || 'general'),
    requireInteraction: true,
    actions: [
      { action: 'open', title: '📋 Buka Dashboard' },
      { action: 'dismiss', title: 'Tutup' },
    ],
  };

  return self.registration.showNotification(
    '⚡ JNE MARTAPURA: ' + title,
    notifOptions
  );
});

// Klik notifikasi → buka / fokus tab dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || '/dashboard';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Cek apakah tab dashboard sudah terbuka
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Kalau belum ada tab yang terbuka, buka baru
        return clients.openWindow(targetUrl);
      })
  );
});
