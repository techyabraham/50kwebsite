import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { OFFER_END_DATE, PAGE_URL, WHATSAPP_NUMBER } from "../constants";
import { OFFER_END_SHORT } from "../utils/formatDate";

const DAILY_REMINDER_HOURS = [9, 18];
const REMINDER_TITLE = "Abraham's ₦50k Website Offer - Closing Soon!";
const REMINDER_BODY = "Tap to reserve your slot before the ₦50,000 offer ends.";

const formatReminderTime = (date) =>
  date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const buildDailyReminders = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const reminders = [];
  for (const day = new Date(start); day <= OFFER_END_DATE; day.setDate(day.getDate() + 1)) {
    DAILY_REMINDER_HOURS.forEach((hour) => {
      const fireAtDate = new Date(day);
      fireAtDate.setHours(hour, 0, 0, 0);
      if (fireAtDate > now && fireAtDate <= OFFER_END_DATE) {
        reminders.push({
          fireAt: fireAtDate.getTime(),
          title: REMINDER_TITLE,
          body: REMINDER_BODY,
          tag: `abraham-offer-reminder-${fireAtDate.toISOString()}`,
        });
      }
    });
  }

  return reminders;
};

export default function ReminderButton({ dark = false, style = {} }) {
  const [status, setStatus] = useState("idle");
  const [reminderCount, setReminderCount] = useState(0);

  const openWhatsAppFallback = () => {
    const message = encodeURIComponent(
      `Hi Abraham, please send me daily reminders about your ₦50,000 website offer before it closes on ${OFFER_END_SHORT}. I don't want to miss it!`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const scheduleWebPushReminder = async () => {
    setStatus("requesting");

    const supported = "serviceWorker" in navigator && "Notification" in window && "PushManager" in window;
    if (!supported) {
      setStatus("unsupported");
      return;
    }

    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();

    if (permission === "denied") {
      setStatus("denied");
      return;
    }

    if (permission !== "granted") {
      setStatus("fallback");
      return;
    }

    try {
      const reminders = buildDailyReminders();
      if (!reminders.length) {
        setStatus("fallback");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      const worker = registration.active || registration.waiting || registration.installing;
      worker?.postMessage({
        type: "SCHEDULE_REMINDERS",
        reminders,
        url: PAGE_URL,
      });

      await registration.showNotification("Reminder Set", {
        body: `We'll remind you twice daily. Next reminder: ${formatReminderTime(new Date(reminders[0].fireAt))}.`,
        icon: "/icon-192.png",
        tag: "reminder-confirmation",
        requireInteraction: false,
      });

      setReminderCount(reminders.length);
      setStatus("scheduled");
    } catch (error) {
      console.error("Service worker registration failed:", error);
      setStatus("fallback");
    }
  };

  const baseClass = dark
    ? "border-white/70 text-white hover:bg-white/10"
    : "border-purple-bright text-purple-bright hover:bg-purple-bright/10";

  return (
    <div style={style}>
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onClick={scheduleWebPushReminder}
            className={`mt-4 rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:brightness-110 ${baseClass}`}
          >
            Remind Me Before the Offer Ends
          </motion.button>
        )}

        {status === "requesting" && (
          <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`mt-4 inline-flex rounded-full border px-5 py-3 text-sm font-semibold opacity-75 ${baseClass}`}>
            Setting up your reminders...
          </motion.div>
        )}

        {status === "scheduled" && (
          <ReminderNotice title="Reminder Set" tone="success">
            {reminderCount} reminders scheduled, two per day where time remains.
          </ReminderNotice>
        )}

        {status === "denied" && (
          <ReminderNotice title="Notifications are blocked" action={openWhatsAppFallback}>
            Ask Abraham to remind you on WhatsApp instead.
          </ReminderNotice>
        )}

        {(status === "unsupported" || status === "fallback") && (
          <ReminderNotice title="Automatic reminder unavailable" action={openWhatsAppFallback}>
            Send Abraham a quick WhatsApp message and he can remind you before it closes.
          </ReminderNotice>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReminderNotice({ title, children, action, tone = "warm" }) {
  const colorClass = tone === "success" ? "border-green-500/40 bg-green-500/10 text-green-700" : "border-orange-fire/30 bg-orange-fire/10 text-purple-mid";

  return (
    <motion.div key={title} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`mt-4 rounded-xl border p-4 text-sm ${colorClass}`}>
      <div className="font-bold">{title}</div>
      <p className="mt-1 leading-relaxed">{children}</p>
      {action && (
        <button onClick={action} className="mt-3 rounded-full bg-[#25D366] px-4 py-2 font-semibold text-white">
          WhatsApp Abraham
        </button>
      )}
    </motion.div>
  );
}

