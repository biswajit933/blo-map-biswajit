const CACHE_NAME = "blo-smart-map-v3";

const urlsToCache = [
  "./",
  "./map.html",
  "./data.csv",
  "https://unpkg.com/leaflet/dist/leaflet.css",
  "https://unpkg.com/leaflet/dist/leaflet.js",
  "https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css",
  "https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css",
  "https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
    .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  let url = event.request.url;
  let request = event.request;

  if (request.mode === "navigate" || request.destination === "document" || url.endsWith("/map.html") || url.endsWith("/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            let responseClone = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone))
            );
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (url.includes("data.csv")) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
  );
});