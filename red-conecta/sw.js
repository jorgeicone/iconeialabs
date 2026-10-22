// Red Conecta · service worker mínimo: cachea el cascarón para que la app instale y abra sin red.
const CACHE = "rc-shell-v3";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./art.js", "./config.js", "./vendor/supabase.js", "./icon.svg", "./manifest.webmanifest"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // Supabase y CDN siempre van a la red
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
