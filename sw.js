// Cosfit Service Worker v1.0
// Coscoom Creative Tech Solutions

const CACHE_NAME = "cosfit-v1.0";
const ASSETS = [
  "/cosfit-app/",
  "/cosfit-app/index.html",
  "/cosfit-app/manifest.json",
  "/cosfit-app/icon.png",
];

// ── Install ──────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cosfit: Caching assets");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch (Offline support) ────────────────────────────
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clone);
          });
          return response;
        })
        .catch(() => caches.match("/cosfit-app/index.html"));
    })
  );
});

// ── Push Notifications ────────────────────────────────
self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || "Cosfit";
  const options = {
    body: data.body || "Your order update is here!",
    icon: "/cosfit-app/icon.png",
    badge: "/cosfit-app/icon.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/cosfit-app/" },
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click ────────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow(e.notification.data.url || "/cosfit-app/")
  );
});
