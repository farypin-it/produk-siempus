/**
 * 🚀 SiE-MPuS Service Worker (Auto-Update Version)
 * Menggunakan strategi: "Network First, fallback to Cache"
 */

const CACHE_NAME = 'siempus-cache-auto';

// 1. Proses Install: Lewati masa tunggu, langsung aktifkan SW baru!
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// 2. Proses Activate: Langsung ambil alih kontrol halaman tanpa perlu reload
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 3. Proses Fetch (Pengambilan Data)
self.addEventListener('fetch', (event) => {
    // Abaikan request selain GET (seperti POST API ke Google Apps Script)
    if (event.request.method !== 'GET') return;

    // Abaikan request dari ekstensi Chrome atau skema aneh
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        // STRATEGI NETWORK FIRST: Selalu coba ambil file terbaru dari server/internet
        fetch(event.request)
            .then((networkResponse) => {
                // Jika berhasil dapat yang terbaru, diam-diam simpan ke Cache untuk cadangan offline
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            })
            .catch(() => {
                // JIKA OFFLINE ATAU KONEKSI TERPUTUS: Baru ambil file dari Cache
                return caches.match(event.request);
            })
    );
});
