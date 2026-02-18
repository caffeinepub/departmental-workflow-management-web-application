/**
 * PWA Reset Utility
 * Provides functions to clear service worker caches, localStorage, and unregister service workers
 */

export async function resetPWA(): Promise<void> {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }
    
    console.log('PWA reset complete');
  } catch (error) {
    console.error('Error during PWA reset:', error);
  }
}

export async function resetAndReload(): Promise<void> {
  await resetPWA();
  window.location.reload();
}
