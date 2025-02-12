// Define a cache name and the files you want to cache
const CACHE_NAME = "cloakcampus-cache-v1";
const urlsToCache = [
  "/", // The main page
  "/index.html", // HTML file
  "/src/index.css", // CSS file
  "/src/App.js", // Your main JavaScript file
  "/icons/icon192.png", // Example icon
  "/icons/icon512.png", // Example icon
];

// Install event: caching files during the service worker installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event: serve cached content when offline or when network is slow
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached resource if found; otherwise, fetch from the network.
      return response || fetch(event.request);
    })
  );
});

// Activate event: clean up old caches if needed
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            // Delete caches that are no longer needed.
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
