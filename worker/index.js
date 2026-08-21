/**
 * Custom service worker logic merged into the generated Workbox worker by
 * @ducanh2912/next-pwa (customWorkerSrc, see next.config.ts). Handles the two
 * things the app's own JS can't do while it's not running: displaying a Web
 * Push notification, and routing a click on it back into the app
 * (frontend-requirements 03 §6-7).
 */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Reminder", body: event.data.text() };
  }

  const title = payload.title || "Reminder";
  const options = {
    body: payload.body,
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
    tag: payload.tag,
    data: { url: payload.url || "/dashboard" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

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
