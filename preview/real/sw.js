/* Sunday Estate no-op service worker (JOBS/071).
   Exists ONLY to satisfy the older Android/Chrome installability criteria
   (manifest + service worker with a fetch handler). It deliberately caches
   NOTHING: this app updates daily and staleness is the enemy. Every fetch
   passes through with the browser's default network handling. */
const SW_VERSION = 'se-sw-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Passthrough: no respondWith call -> network untouched. Merely registering
// this listener satisfies the legacy install check without cache risk.
self.addEventListener('fetch', () => {})
