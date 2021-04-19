// Fill here with your cache name-version.
const CACHE_NAME = "barf-zigi-v1";
// This is the list of URLs to be cached by your Progressive Web App.
const CACHED_URLS = [
  "/",
  "/index.html",
  "/meal/assets/style.css",
  "/meal/assets/script.js",
  "/meal/assets/icons/arrow-out.svg",
  "/meal/assets/icons/bones.svg",
  "/meal/assets/icons/liver.svg",
  "/meal/assets/icons/meat.svg",
  "/meal/assets/icons/offal.svg",
  "/meal/assets/icons/offalWithLiver.svg",
  "/meal/assets/icons/package.svg",
  "/meal/assets/icons/supplements.svg",
  "/meal/assets/icons/vegetables.svg",
  "/meal/assets/images/android-chrome-192x192.png",
  "/meal/assets/images/apple-touch-icon-120x120.png",
  "/meal/assets/images/apple-touch-icon-180x180.png",
  "/meal/assets/images/apple-touch-icon-76x76.png",
  "/meal/assets/images/favicon-16x16.png",
  "/meal/assets/images/mstile-150x150.png",
  "/meal/assets/images/android-chrome-512x512.png",
  "/meal/assets/images/apple-touch-icon-152x152.png",
  "/meal/assets/images/apple-touch-icon-60x60.png",
  "/meal/assets/images/apple-touch-icon.png",
  "/meal/assets/images/favicon-32x32.png",
];
const DO_NOT_CACHE_URLS = ["/api"];

// Open cache on install.
/* Start the service worker and cache all of the app's content */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async function () {
      const cache = await caches.open(CACHE_NAME);

      await cache.addAll(CACHED_URLS);
    })()
  );
});

// Cache and update with stale-while-revalidate policy.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Prevent Chrome Developer Tools error:
  // Failed to execute 'fetch' on 'ServiceWorkerGlobalScope': 'only-if-cached' can be set only with 'same-origin' mode
  //
  // See also https://stackoverflow.com/a/49719964/1217468
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") {
    return;
  }

  if (DO_NOT_CACHE_URLS.some((url) => request.url.includes(url))) {
    return;
  }

  event.respondWith(
    (async function () {
      const cache = await caches.open(CACHE_NAME);

      const cachedResponsePromise = await cache.match(request);
      const networkResponsePromise = fetch(request);

      if (request.url.startsWith(self.location.origin)) {
        event.waitUntil(
          (async function () {
            const networkResponse = await networkResponsePromise;

            await cache.put(request, networkResponse.clone());
          })()
        );
      }

      return cachedResponsePromise || networkResponsePromise;
    })()
  );
});

// Clean up caches other than current.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async function () {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })()
  );
});
