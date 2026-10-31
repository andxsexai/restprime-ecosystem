const CACHE = 'restprime-os-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['/', '/favicon.svg', '/manifest.webmanifest'])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const fresh = await fetch(event.request)
        if (fresh.ok && new URL(event.request.url).origin === self.location.origin) {
          cache.put(event.request, fresh.clone())
        }
        return fresh
      } catch {
        const hit = await cache.match(event.request)
        if (hit) return hit
        return cache.match('/')
      }
    }),
  )
})
