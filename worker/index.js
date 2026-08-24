/**
 * Custom service worker logic merged into the generated Workbox worker by
 * @ducanh2912/next-pwa (customWorkerSrc, see next.config.ts). Handles the things the app's
 * own JS can't do while it's not running: displaying a Web Push notification (with action
 * buttons where the platform supports them), acting on those buttons directly — no need to
 * open the app — and routing a plain tap on the notification back into the app
 * (frontend-requirements 03 §6-7).
 */

// Inlined at build time by webpack (next-pwa runs this file through the same pipeline as the
// rest of the app) — same env var the app's own API client uses (src/lib/env.ts). The service
// worker runs in this origin regardless of which page (if any) is open, and the backend is a
// different origin, so this can't be a relative path.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ACTION_LABELS = {
  start: "Start",
  complete: "Complete",
  skip: "Skip",
  close: "Close",
};

// "close" is a distinct label (an abandon action for timeless activities, see
// notification-scheduler.ts) but maps to the same backend transition as "skip".
const ACTION_ENDPOINTS = {
  start: "start",
  complete: "complete",
  skip: "skip",
  close: "skip",
};

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Reminder", body: event.data.text() };
  }

  const title = payload.title || "Reminder";
  const actions = Array.isArray(payload.actions) ? payload.actions : [];
  const options = {
    body: payload.body,
    // Must match an icon that actually exists (see public/manifest.json) — a path to a
    // missing file silently renders with no icon rather than erroring.
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag,
    data: { url: payload.url || "/dashboard", activityLogId: payload.activityLogId || null },
    // Haptic alarm feel on mobile, and stays on screen until the user acts on it rather than
    // auto-dismissing like a passing notification.
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    // Unsupported actions/keys are simply ignored by browsers that don't support them (e.g.
    // iOS Safari currently shows no buttons at all — tapping the notification body still
    // opens the app to the right place, see notificationclick below).
    actions: actions.map((action) => ({ action, title: ACTION_LABELS[action] || action })),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const action = event.action; // "" when the notification body itself was tapped, not a button
  const data = event.notification.data || {};
  event.notification.close();

  if (action && ACTION_ENDPOINTS[action] && data.activityLogId) {
    event.waitUntil(performTrackingAction(data.activityLogId, ACTION_ENDPOINTS[action]));
    return;
  }

  const targetUrl = data.url || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});

/**
 * Calls the same tracking endpoint the in-app Start/Complete/Skip buttons call
 * (my_day_tracker_web/src/lib/api/tracking.ts), directly from the service worker — no window
 * needs to be open. Auth is the httpOnly access-token cookie, which `credentials: "include"`
 * sends automatically; if it's expired, one refresh + retry mirrors the app's own axios
 * interceptor (src/lib/api/client.ts) before giving up.
 */
async function performTrackingAction(activityLogId, endpoint) {
  if (!API_URL) return;
  const url = `${API_URL}/activity-logs/${activityLogId}/${endpoint}`;

  const attempt = () => fetch(url, { method: "POST", credentials: "include" });

  let response = await attempt();
  if (response.status === 401) {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include" });
    if (refreshed.ok) {
      response = await attempt();
    }
  }

  if (!response.ok) {
    // Couldn't complete the action headlessly (session truly expired, network error, activity
    // no longer in a valid state, etc.) — surface a follow-up notification rather than silently
    // failing, since there's no window open to show an error toast in.
    await self.registration.showNotification("Action didn't go through", {
      body: "Open the app to try again.",
      icon: "/icons/icon-192.png",
      data: { url: "/dashboard" },
    });
  }
}
