// Minimal service worker: no caching, network-only.
// Keeps the app installable as a PWA without stale-content headaches.
// Existing caches from older versions of this file are wiped on activate.


self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );

  self.clients.claim();
});

// No fetch handler — every request goes straight to the network as normal.
