const PRECACHE_NAME = 'pwa-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/offline/',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {

        if (event.request.mode === 'navigate' || 
           (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
          
          return caches.match('/offline.html')
            .then((response) => response || caches.match('/offline/'))
            .then((response) => response || caches.match('/'));
        }

        return null;
      });
    })
  );
});

self.addEventListener('push', event => {
  let title = 'Kabar Terbaru, Bro!';
  let options = {
    body: 'Ada artikel baru yang menarik di web. Klik untuk baca!',
    icon: 'https://bestliriklagu.com/image/192.png',
    badge: 'https://bestliriklagu.com/image/72.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      title = dataJson.title || title;
      options.body = dataJson.body || options.body;
      if (dataJson.icon) options.icon = dataJson.icon;
    } catch (e) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
