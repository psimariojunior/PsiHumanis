const CACHE = "psihumanis-v14"
const STATIC_CACHE = "psihumanis-static-v14"
const IMAGE_CACHE = "psihumanis-images-v14"

const PRECACHE_URLS = [
  "/offline.html",
  "/favicon.svg",
  "/favicon-32.png",
  "/pwa-72-v5.png",
  "/pwa-96-v5.png",
  "/pwa-128-v5.png",
  "/pwa-144-v5.png",
  "/pwa-152-v5.png",
  "/pwa-192-v5.png",
  "/pwa-192-v5-maskable.png",
  "/pwa-384-v5.png",
  "/pwa-512-v5.png",
  "/pwa-512-v5-maskable.png",
  "/og-image.png",
  "/logo.png",
]

const isImage = (url) => /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url)
const isFont = (url) => /\.(woff2?|ttf|otf|eot)$/i.test(url)
const isApi = (url) => url.includes("/api/")
const isNextStatic = (url) => url.includes("/_next/")
const isDashboardPage = (url) => /^\/(dashboard|paciente|agenda|sessoes|prontuarios|financeiro|cobrancas|notificacoes|comunicacao|relatorios|diario-emocoes|configuracoes|disponibilidade|sala-virtual|pacientes)(\/|$)/.test(url)

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(STATIC_CACHE),
      caches.open(IMAGE_CACHE),
    ]).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  const keepCaches = [CACHE, STATIC_CACHE, IMAGE_CACHE]
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keepCaches.includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
  // Notify clients that a new version is ready
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ type: "SW_UPDATED" }))
  })
})

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {}
  const title = data.title || "PsiHumanis"
  const body = data.body || "Você tem uma nova notificação."
  const icon = data.icon || "/pwa-192-v5.png"
  const badge = "/pwa-72-v5.png"
  const tag = data.tag || "default"
  const url = data.url || "/"

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url },
      vibrate: [200, 100, 200],
      actions: data.actions || [],
      requireInteraction: true,
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-forms") {
    event.waitUntil(syncPendingForms())
  }
})

async function syncPendingForms() {
  try {
    const cache = await caches.open(CACHE)
    const requests = await cache.keys()
    for (const request of requests) {
      const url = new URL(request.url)
      if (url.pathname.startsWith("/api/") && url.pathname.includes("pending-sync")) {
        const response = await cache.match(request)
        if (response) {
          const body = await response.clone().json()
          await fetch(request.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
          await cache.delete(request)
        }
      }
    }
  } catch {}
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET") return
  if (isApi(url.pathname)) return
  if (url.origin !== self.location.origin) return

  // Landing pages — always go to network, never cache
  if (url.pathname === "/" || url.pathname === "/en") {
    return
  }

  if (isNextStatic(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  if (isDashboardPage(url.pathname) || request.mode === "navigate") {
    event.respondWith(networkFirstWithOffline(request))
    return
  }

  if (isImage(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  if (isFont(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  event.respondWith(staleWhileRevalidate(request))
})

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const clone = response.clone()
      caches.open(CACHE).then((cache) => cache.put(request, clone))
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return caches.match("/offline.html")
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const clone = response.clone()
      caches.open(cacheName).then((cache) => cache.put(request, clone))
    }
    return response
  } catch {
    return new Response("", { status: 408 })
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      const clone = response.clone()
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
    }
    return response
  }).catch(() => cached)
  return cached || fetchPromise
}
