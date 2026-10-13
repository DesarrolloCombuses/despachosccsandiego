// Service worker - Despachos CC San Diego
// Estrategia:
//   - Assets propios (HTML/JS/CSS/icons): Network-First con timeout, fallback a cache. Se revalidan con el
//     servidor (cache "no-cache") para no servir un index.html viejo del cache HTTP justo despues de publicar.
//   - Librerias de CDN con version fija (CDN_ASSETS): Cache-First en un cache aparte que sobrevive a las
//     actualizaciones de la app, porque ese archivo nunca cambia.
//   - APIs (Supabase, Google Sheets CSV, Sonar): pasan directo a la red, NUNCA se cachean.
//   - Auto-update: skipWaiting + clients.claim para que la nueva version reemplace a la anterior al instante.
// La version se cambia con "python tools/version.py", no a mano.

const VERSION = "ccsd-mobile-v1.1.0";
const CACHE_NAME = `planilla-${VERSION}`;
const CDN_CACHE_NAME = "ccsd-cdn";
const NETWORK_TIMEOUT_MS = 4000;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./js/functions.js?v=1.1.0",
  "./js/main.js?v=1.1.0",
  "./js/pwa.js?v=1.1.0",
  "./css/styles.css?v=1.1.0",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./icons/icon-maskable.svg",
];

// Debe coincidir con los <script> de CDN de index.html.
const CDN_ASSETS = [
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js",
];

// Dominios cuyas respuestas NUNCA se cachean (datos vivos).
const NO_CACHE_HOSTS = [
  "supabase.co",
  "supabase.in",
  "docs.google.com",
  "googleusercontent.com",
  "googleapis.com",
  "fonts.gstatic.com",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const [cache, cdnCache] = await Promise.all([caches.open(CACHE_NAME), caches.open(CDN_CACHE_NAME)]);
    const missingCdn = [];
    for (const url of CDN_ASSETS) {
      if (!(await cdnCache.match(url, { ignoreVary: true }))) missingCdn.push(url);
    }
    // Por separado: si el CDN falla no se pierde el precache de la app (y viceversa).
    await Promise.all([
      cache.addAll(PRECACHE_URLS).catch(() => null),
      cdnCache.addAll(missingCdn).catch(() => null),
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== CDN_CACHE_NAME).map((k) => caches.delete(k)));
    // Borra del cache de CDN las librerias que ya no se usan (p. ej. tras subir de version supabase-js).
    const cdnCache = await caches.open(CDN_CACHE_NAME);
    const cdnKeys = await cdnCache.keys();
    await Promise.all(cdnKeys.filter((req) => !CDN_ASSETS.includes(req.url)).map((req) => cdnCache.delete(req)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((c) => c.postMessage({ type: "SW_ACTIVATED", version: VERSION }));
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function shouldBypass(url) {
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;
  if (NO_CACHE_HOSTS.some((host) => url.hostname.endsWith(host))) return true;
  return false;
}

function isSameOriginAsset(url) {
  return url.origin === self.location.origin;
}

// "no-cache" revalida con el servidor (304 si no cambio). Una navegacion no admite RequestInit,
// por eso se pide por URL.
function fetchFresh(request) {
  if (request.mode === "navigate") {
    return fetch(request.url, { cache: "no-cache", credentials: "same-origin" });
  }
  return fetch(request, { cache: "no-cache" });
}

async function cacheFirst(request) {
  const cache = await caches.open(CDN_CACHE_NAME);
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fetchPromise = fetchFresh(request);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("network-timeout")), NETWORK_TIMEOUT_MS)
    );
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    if (response && response.status === 200 && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const fallback = await cache.match("./index.html");
      if (fallback) return fallback;
    }
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (CDN_ASSETS.includes(url.href)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (shouldBypass(url)) return;

  if (isSameOriginAsset(url)) {
    event.respondWith(networkFirst(request));
  }
});
