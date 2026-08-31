const CACHE_NAME = "general-ps4-host-v2026.2";
const urlsToCache = [
  "index.html",
  "sw.js",
  "manifest.webmanifest",
  "song.mp3",
  "shop-logo.png",
  "505_960/",
  "1000_1102/",
  "1150-1300/"
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// استراتيجية: الشبكة أولاً مع الرجوع إلى الكاش
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // إذا كانت الاستجابة صالحة، خزّن نسخة في الكاش
        if (response.ok && event.request.method === "GET") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // عند فشل الشبكة، ابحث في الكاش
        return caches.match(event.request);
      })
  );
});

// تنظيف الكاشات القديمة عند تفعيل نسخة جديدة
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});