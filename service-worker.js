const CACHE_NAME = "thruway-rest-stops-v4.1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./thruway.json",
  "./base.css",
  "./layout.css",
  "./theme-mac.css",
  "./standard-theme.css",
  "./fonts/ChiKareGo2.ttf"
];

// INSTALL — cache the app shell + data for offline use
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE — clean out old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH — cache-first for everything, so the app works fully offline.
// Use the "999" mile marker trick in the app to force a fresh pull from the server.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (
            event.request.method === "GET" &&
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
