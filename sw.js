const CACHE_NAME = 'ai-social-assistant-v8';
const SHARED_IMAGE_CACHE_NAME = 'shared-image-cache';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Utility function to convert a Blob to a base64 string
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Install the service worker and cache the app shell
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, SHARED_IMAGE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


// On fetch, handle GET for cache-first and POST for share target
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- Handle Share Target POST request ---
  if (event.request.method === 'POST' && url.pathname === '/') {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const imageFile = formData.get('image');

        if (imageFile && imageFile.type.startsWith('image/')) {
          const base64Data = await blobToBase64(imageFile);
          const imageData = {
            data: base64Data,
            mimeType: imageFile.type,
          };
          
          const cache = await caches.open(SHARED_IMAGE_CACHE_NAME);
          const responseBody = JSON.stringify(imageData);
          const response = new Response(responseBody, {
            headers: { 'Content-Type': 'application/json' }
          });
          await cache.put(new Request('shared-image'), response);

          return Response.redirect('/', 303);
        } else {
           return Response.redirect('/', 303);
        }
      } catch (err) {
        console.error('Share target handling failed:', err);
        return Response.redirect('/', 303);
      }
    })());
    return;
  }

  // --- Handle GET requests with cache-first strategy ---
  if (event.request.method === 'GET') {
     event.respondWith(
        caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
    
            return fetch(event.request).then(
              (networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                  return networkResponse;
                }
    
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
    
                return networkResponse;
              }
            );
          })
      );
  }
});
