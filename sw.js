// Keeps the app shell on the device so it opens like installed software, even on a weak connection.
const CACHE = "cbpd-v4";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-32.png", "./logo-mark.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; // Google Sheet calls always go to the network
  if (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")) {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; }).catch(() => caches.match(req).then((m) => m || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then((m) => m || fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; })));
});
