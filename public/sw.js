// ============================================================
// Decifra App — Service Worker v2
// Estratégia: Cache-First para assets estáticos,
//             Network-First para API/Gemini,
//             Offline fallback para navegação SPA.
// ============================================================

const CACHE_NAME = 'decifra-v2';

// Assets essenciais para experiência offline mínima (TWA Play Store)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/sw.js',
];

// ── Install: pré-cacheia assets críticos ───────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: remove caches antigos (cine-exegese-v1, etc.) ─
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: estratégia por tipo de recurso ──────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Não interceptar requisições de outras origens (Gemini API, Firebase Functions)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Não interceptar /.well-known/ — deve sempre ser servido pelo servidor
  if (url.pathname.startsWith('/.well-known/')) {
    return;
  }

  // 3. Assets estáticos: Cache-First
  const isStaticAsset =
    url.pathname.startsWith('/decifra-assets/') ||
    url.pathname.startsWith('/home-crops/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf|css|js)$/);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Navegação SPA (rotas HTML): Network-First com fallback para /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html').then((cached) => {
          if (cached) return cached;
          // Fallback de emergência embutido
          return new Response(
            `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Decifra — Sem conexão</title>
  <style>
    body { margin:0; display:flex; flex-direction:column; align-items:center;
           justify-content:center; min-height:100vh; background:#050505;
           font-family:system-ui,sans-serif; color:#e8d9c0; text-align:center; padding:24px; }
    h1  { font-size:2rem; margin-bottom:8px; }
    p   { color:#8e8377; font-size:0.95rem; max-width:320px; }
    button { margin-top:24px; padding:12px 28px; border-radius:999px;
             background:linear-gradient(135deg,#a6792a,#c49540);
             color:#fff; font-weight:700; border:none; cursor:pointer;
             font-size:1rem; }
  </style>
</head>
<body>
  <h1>📖 Decifra</h1>
  <p>Você está sem conexão com a internet. Conecte-se e tente novamente.</p>
  <button onclick="location.reload()">Tentar novamente</button>
</body>
</html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        });
      })
    );
    return;
  }

  // 5. Demais requisições: Network com fallback para cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
