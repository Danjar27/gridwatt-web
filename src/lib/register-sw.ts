// src/lib/register-sw.ts
// Register service worker for offline caching
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(
                (reg) => {
                    // Registration successful
                },
                (err) => {
                    // Registration failed
                }
            );
        });
    }
}
