const SHELL_CACHE = "weather-shell-v1";
const FORECAST_CACHE = "weather-forecasts-v1";
const LOCATION_CACHE = "weather-locations-v1";
const PRECACHE_URLS = __PRECACHE_URLS__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("weather-") &&
                ![SHELL_CACHE, FORECAST_CACHE, LOCATION_CACHE].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Network timeout")), 4000);
  });
  const network = fetch(request).then(async (response) => {
    if (response.ok) {
      try {
        await cache.put(request, response.clone());
        const keys = await cache.keys();
        const expiredKeys = keys.slice(0, Math.max(0, keys.length - maxEntries));
        await Promise.all(expiredKeys.map((key) => cache.delete(key)));
      } catch (error) {
        console.warn("Weather data could not be saved for offline use.", error);
      }
    }
    return response;
  });

  try {
    return await Promise.race([network, timeout]);
  } catch {
    const savedResponse = await cache.match(request);
    if (savedResponse) return savedResponse;
    throw new Error("No network or cached response is available");
  } finally {
    clearTimeout(timeoutId);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin && request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const savedPage = await caches.match(request);
        return savedPage || caches.match("/");
      }),
    );
    return;
  }

  if (url.hostname === "api.open-meteo.com" && url.pathname === "/v1/forecast") {
    event.respondWith(networkFirst(request, FORECAST_CACHE, 20));
    return;
  }

  if (
    url.hostname === "geocoding-api.open-meteo.com" &&
    url.pathname === "/v1/search"
  ) {
    event.respondWith(networkFirst(request, LOCATION_CACHE, 30));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((savedResponse) => savedResponse || fetch(request)),
    );
  }
});
