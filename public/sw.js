self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SCHEDULE_REMINDERS") return;

  const { reminders = [], url } = event.data;
  const showReminder = ({ title, body, tag }) => {
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-72.png",
      tag,
      renotify: true,
      requireInteraction: true,
      data: { url },
      actions: [
        { action: "reserve", title: "Reserve My Slot Now" },
        { action: "dismiss", title: "Dismiss" },
      ],
    });
  };

  reminders.forEach((reminder) => {
    const delay = reminder.fireAt - Date.now();
    if (delay <= 0) return;
    setTimeout(() => showReminder(reminder), delay);
  });
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
