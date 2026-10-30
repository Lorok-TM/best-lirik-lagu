const CACHE_NAME = 'bestliriklagu-pwa-cache-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/offline',
  '/offline/',
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
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return fetch(new Request(url, { mode: 'no-cors', credentials: 'omit' }))
            .then((response) => {
              return cache.put(url, response);
            })
            .catch((err) => console.error('Gagal pre-cache:', url, err));
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === self.location.origin) {
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })

          .catch(() => {
            return caches.match(event.request, { ignoreSearch: true }).then((response) => {
              return response || caches.match('/offline') || caches.match('/');
            });
          })
        
      );
    } else {
      event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          return cachedResponse || fetch(event.request).then((netResp) => {
            if (netResp.status === 200 || netResp.type === 'opaque') {
              const respClone = netResp.clone();
              caches.open(CACHE_NAME).then((c) => c.put(event.request, respClone));
            }
            return netResp;
          }).catch(() => new Response('Offline asset missing', { status: 404 }));
        })
      );
    }
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
