const CACHE_NAME = 'okanenote-v1';
const ASSETS = [
  '/kakeibo/',
  '/kakeibo/index.html',
];

// インストール時にキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワーク優先、失敗時にキャッシュを返す
self.addEventListener('fetch', e => {
  // GASへのリクエストはキャッシュしない
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 成功したらキャッシュを更新
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
