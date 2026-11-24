// Guarda o app no celular para abrir sem internet. Os seus dados ficam no navegador, não aqui.
const CACHE = 'bity-20261124190121';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const put = (req, res) => { if (res && res.ok){ const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; };
  if (u.origin === location.origin){
    // Primeiro tenta a internet (para receber atualizações); sem rede, usa a cópia guardada.
    e.respondWith(fetch(e.request).then(r => put(e.request, r)).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => put(e.request, res))));
  }
});
