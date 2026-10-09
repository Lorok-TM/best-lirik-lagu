const CACHE = "pwabuilder-offline-page";
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
const offlineFallbackPage = "/offline.html";
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}
workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;
        if (preloadResp) {
          return preloadResp;
        }
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

self.addEventListener('push', (event) => {
  let title = 'Kabar Terbaru, Bro!';
  let urlTujuan = '/';
  let options = {
    body: 'Ada artikel baru yang menarik di web. Klik untuk baca!',
    icon: 'https://bestliriklagu.com/image/192.png',
    badge: 'https://bestliriklagu.com/image/72.png',
    vibrate: [100, 50, 100],
    data: {
      url: urlTujuan
    }
  };
  if (event.data) {
    try {
      const dataSakaServer = event.data.json();
      title = dataSakaServer.title || title;
      options.body = dataSakaServer.body || options.body;
      if (dataSakaServer.url) {
        options.data.url = dataSakaServer.url;
      }
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
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});
