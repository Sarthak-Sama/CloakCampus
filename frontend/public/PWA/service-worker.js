// Define a cache name and the files you want to cache
const CLOACKCAMPUS_CACHE = "cloakcampus-cache-v1";
const urlsToCache = [
  "/", // The main page
  "/index.html", // HTML file
  "/src/index.css", // CSS file
  "/src/App.js", // Main JavaScript file
  "/icons/ccIcon192.png", // Example icon
  "/icons/ccIcon512.png", // Example icon
];

// Install event: caching files during the service worker installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CLOACKCAMPUS_CACHE)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.error("Cache open failed:", err))
  );
});

// Fetch event: serve cached content when available, fall back to network otherwise
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached resource if found; otherwise, fetch from network.
      return (
        response ||
        fetch(event.request)
          .then((networkResponse) => {
            // Optionally, you could cache new responses here if needed.
            return networkResponse;
          })
          .catch((error) => {
            console.error("Fetch failed; returning offline fallback.", error);
            // Optionally return a fallback here.
          })
      );
    })
  );
});

// Activate event: clean up old caches if needed
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CLOACKCAMPUS_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
