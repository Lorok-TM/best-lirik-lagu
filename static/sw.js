const PRECACHE_NAME = 'pwa-cache-v4';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/offline/',
  '/offline/index.html',
  '/favicon.ico',
  '/author/',
  '/author/katrok/',
  '/categories/',
  '/categories/page/2/',
  '/categories/page/3/',
  '/categories/page/4/',
  '/categories/page/5/',
  '/categories/aceh/',
  '/categories/arab/',
  '/categories/bali/',
  '/categories/band/',
  '/categories/banjar/',
  '/categories/batak/',
  '/categories/bugis/',
  '/categories/campursari/',
  '/categories/dangdut/',
  '/categories/dayak/',
  '/categories/gayo/',
  '/categories/iban/',
  '/categories/indo/',
  '/categories/jawa/',
  '/categories/karo/',
  '/categories/kelate/',
  '/categories/kerinci/',
  '/categories/madura/',
  '/categories/malaysia/',
  '/categories/manado/',
  '/categories/manca/',
  '/categories/mandar/',
  '/categories/manggarai/',
  '/categories/melayu/',
  '/categories/minang/',
  '/categories/nias/',
  '/categories/osing/',
  '/categories/ost/',
  '/categories/other-music/',
  '/categories/reggae/',
  '/categories/religi/',
  '/categories/remix/',
  '/categories/rohani/',
  '/categories/sasak/',
  '/categories/simalungun/',
  '/categories/slow-rock/',
  '/categories/sunda/',
  '/categories/tapsel/',
  '/categories/tarling/',
  '/categories/tayub/',
  '/categories/tiktok/',
  '/categories/timur/',
  '/categories/toraja/',
  '/page/',
  '/page/2/',
  '/page/3/',
  '/page/4/',
  '/page/5/',
  '/page/about/',
  '/page/contact/',
  '/post/',
  '/post/page/2/',
  '/post/page/3/',
  '/post/page/4/',
  '/post/page/5/',
  '/archives/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== PRECACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isHtmlRequest = event.request.mode === 'navigate' || 
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(PRECACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/offline/')
              .then((res) => res || caches.match('/offline/index.html'))
              .then((res) => res || caches.match('/'));
          });
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(PRECACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});

self.addEventListener('push', (event) => {
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
