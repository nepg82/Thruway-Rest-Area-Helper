const CACHE_NAME = "thruway-rest-stops-v2";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

// ACTIVATE (clean old caches)
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

// FETCH STRATEGY
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 1. NETWORK-FIRST for dynamic data (THIS FIXES YOUR BUG)
  if (url.includes("thruway.json")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. CACHE-FIRST for app shell assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // only cache successful GET requests
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
          // fallback only for navigation
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
