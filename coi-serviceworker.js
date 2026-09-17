// coi-serviceworker.js - Activates Cross-Origin Isolation on GitHub Pages
if (typeof window === 'undefined') {
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener('fetch', (event) => {
        if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
            return;
        }
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.status === 0) return response;
                
                const newHeaders = new Headers(response.headers);
                newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
                newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            })
        );
    });
} else {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('coi-serviceworker.js').then((registration) => {
            registration.addEventListener('updatefound', () => {
                window.location.reload();
            });
        });
    }
}
