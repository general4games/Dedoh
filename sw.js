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
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("SW: Installing and caching files");
      return cache.addAll(urlsToCache);
    }).catch(function(error) {
      console.error("SW: Cache install failed", error);
    })
  );
});

// استراتيجية: الشبكة أولاً مع الرجوع إلى الكاش
self.addEventListener("fetch", function(event) {
  // Only cache GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request).then(function(response) {
      // Validate response
      if (!response || response.status !== 200 || response.type === "error") {
        return response;
      }

      // Clone the response before caching
      var responseToCache = response.clone();
      
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, responseToCache);
      });

      return response;
    }).catch(function() {
      // Network failed, try cache
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        }
        // Return offline page if available
        return caches.match("index.html");
      });
    })
  );
});

// تنظيف الكاشات القديمة عند تفعيل نسخة جديدة
self.addEventListener("activate", function(event) {
  console.log("SW: Activating");
  var cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("SW: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
