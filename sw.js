// Kill Switch para o Service Worker (Projeto Decifra)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  return; // Não cachear nada
});
