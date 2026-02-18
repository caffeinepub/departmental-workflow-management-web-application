# Specification

## Summary
**Goal:** Prevent “Version 24 not working” blank-page failures by adding a startup error fallback and improving service worker caching/update behavior so new deployments reliably load.

**Planned changes:**
- Add an app-level runtime error fallback to show a readable error screen on uncaught startup failures, with actions to “Reload” and “Reset and Reload” (clear localStorage, clear service worker caches when available, attempt service worker unregister, then reload).
- Adjust service worker caching for navigation requests to use a network-first strategy to avoid stale cached app shell after deployments, while keeping offline fallback working.
- Improve service worker update handling in the React app: detect when an update is waiting/installed and show a visible prompt to reload and apply the update; ensure failures in service worker registration do not crash the app.

**User-visible outcome:** If the app fails to start, users see an English error screen with reload options instead of a blank page; after deployments, refresh loads the latest version reliably; when an update is available, users get a prompt to reload and apply it.
