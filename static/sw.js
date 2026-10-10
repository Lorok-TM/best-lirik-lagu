const CACHE_NAME = 'pwa-cache-v1'; 
const urlsToCache = [
  '/',
  '/offline.html',
  '/offline/',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Simpan aset utama Situs');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Hapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 1. Pagar akhir khusus untuk navigasi halaman (HTML)
  if (event.request.mode === 'navigate' || 
     (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request).catch(() => {
        // Coba cari /offline.html dulu, jika gagal/tidak ketemu, coba cari /offline/
        return caches.match('/offline.html')
          .then((response) => response || caches.match('/offline/'))
          .then((response) => response || caches.match('/')); // Pilihan terakhir jika semua gagal
      })
    );
    return; // Stop di sini untuk request HTML
  }

  // 2. Untuk request aset non-HTML (CSS, JS, Gambar) jika offline
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Jangan kembalikan '/' untuk gambar/CSS agar tidak merusak tampilan, biarkan eror network biasa atau kosongkan
        return new Response('', { status: 408, statusText: 'Network Error' });
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
