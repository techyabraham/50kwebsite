import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { OFFER_END_DATE, PAGE_URL, WHATSAPP_NUMBER } from "../constants";

const REMINDER_HOURS_BEFORE = 6;
const REMINDER_FIRE_AT = new Date(OFFER_END_DATE.getTime() - REMINDER_HOURS_BEFORE * 60 * 60 * 1000);
const REMINDER_TITLE = "Abraham's ₦50k Website Offer - Closing Soon!";
const REMINDER_BODY = `Only ${REMINDER_HOURS_BEFORE} hours left. Tap to reserve your slot before the ₦50,000 offer ends.`;

const formatReminderTime = (date) =>
  date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ReminderButton({ dark = false, style = {} }) {
  const [status, setStatus] = useState("idle");

  const openWhatsAppFallback = () => {
    const message = encodeURIComponent(
      "Hi Abraham, please send me a reminder about your ₦50,000 website offer before it closes on September 2nd, 2026. I don't want to miss it!",
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
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      const worker = registration.active || registration.waiting || registration.installing;
      worker?.postMessage({
        type: "SCHEDULE_REMINDER",
        fireAt: REMINDER_FIRE_AT.getTime(),
        title: REMINDER_TITLE,
        body: REMINDER_BODY,
        url: PAGE_URL,
      });

      await registration.showNotification("Reminder Set", {
        body: `We'll remind you on ${formatReminderTime(REMINDER_FIRE_AT)}, ${REMINDER_HOURS_BEFORE} hours before the offer ends.`,
        icon: "/icon-192.png",
        tag: "reminder-confirmation",
        requireInteraction: false,
      });

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
            Setting up your reminder...
          </motion.div>
        )}

        {status === "scheduled" && (
          <ReminderNotice title="Reminder Set" tone="success">
            You'll get a notification on {formatReminderTime(REMINDER_FIRE_AT)}.
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
