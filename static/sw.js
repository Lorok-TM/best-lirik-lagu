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
  let options = {
    body: 'Ada artikel baru yang menarik di web. Klik untuk baca!',
    icon: 'https://bestliriklagu.com/image/192.png',
    badge: 'https://bestliriklagu.com/image/72.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };
  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    options.body = data.body || options.body;
    options.data.url = data.url || options.data.url;
  }
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
