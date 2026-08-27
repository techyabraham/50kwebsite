self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SCHEDULE_REMINDER") return;

  const { fireAt, title, body, url } = event.data;
  const delay = fireAt - Date.now();

  const showReminder = () => {
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-72.png",
      tag: "abraham-offer-reminder",
      renotify: true,
      requireInteraction: true,
      data: { url },
      actions: [
        { action: "reserve", title: "Reserve My Slot Now" },
        { action: "dismiss", title: "Dismiss" },
      ],
    });
  };

  if (delay <= 0) {
    showReminder();
    return;
  }

  setTimeout(showReminder, delay);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "https://50kwebsite.vercel.app/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
      return undefined;
    }),
  );
});
