import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import React from "react";
import { useEffect, useMemo, useState } from "react";

// Configure these before launch.
const OFFER_END_DATE = new Date("2026-08-23T23:59:00+01:00");
const INITIAL_SLOTS = 20;
const WHATSAPP_NUMBER = "2348182126524";
const PAGE_URL = "https://example.com/abraham-50000-website-offer";

const faqs = [
  ["Is ₦50,000 really the full price?", "Yes. For this 48-hour window, it covers the complete website package listed here. No hidden setup charge is added."],
  ["Will Abraham build it personally?", "Yes. This offer is personal. Abraham is the person reviewing your business, planning your pages, and building the site."],
  ["How long will my website take?", "After payment and content confirmation, Abraham will agree a practical timeline with you on WhatsApp based on the size of your website."],
  ["Do I need to already have a domain?", "No. Domain and hosting are included in this package, with the final name confirmed after your slot is paid."],
  ["Can I pay after the website is done?", "No. The slot is confirmed by payment because only 20 spaces are available and Abraham is committing real build time."],
  ["What happens after the 48 hours?", "The offer closes and the standard website price returns to ₦350,000. The countdown is fixed and does not reset."],
  ["How do I know my slot is actually reserved?", "Your form submission holds it for 30 minutes. Payment confirms it permanently. Abraham sends a WhatsApp message to confirm."],
  ["What if I'm outside Lagos?", "Abraham builds websites remotely. Location does not matter. He works with businesses across Nigeria."],
];

const offerItems = [
  "Full website with unlimited pages",
  "Mobile optimised design",
  "Domain included",
  "Hosting included",
  "Live WhatsApp chat",
  "Portfolio section",
  "Testimonials section",
  "Contact forms",
  "Social media integration",
  "Built personally by Abraham",
];

const forYou = [
  "You run a real small business and need people to trust you online.",
  "You have delayed getting a website because the usual price felt too high.",
  "You are ready to send your business details and respond quickly.",
  "You want a professional web presence, not a cheap-looking page.",
];

const notForYou = [
  "You want a complex app, marketplace, or custom software system.",
  "You are not ready to pay and confirm your slot within the window.",
  "You want Abraham to copy another brand exactly.",
  "You are looking for endless revisions without clear direction.",
];

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate - new Date();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function scrollToForm() {
  document.getElementById("reservation-form")?.scrollIntoView({ behavior: "smooth" });
}

function useReveal() {
  const reduced = useReducedMotion();
  return reduced
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.6, ease: "easeOut" },
      };
}

function CountdownText({ timeLeft }) {
  return (
    <span className="font-accent tabular-nums text-orange-warm">
      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  );
}

function SectionDivider() {
  return <div className="mx-auto h-px w-full max-w-5xl bg-[linear-gradient(90deg,transparent,#9333EA,transparent)]" />;
}

function CalendarReminderButton({ dark = false }) {
  const downloadCalendarReminder = () => {
    const offerEnd = OFFER_END_DATE;
    const reminderTime = new Date(offerEnd.getTime() - 6 * 60 * 60 * 1000);
    const format = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${format(reminderTime)}`,
      `DTEND:${format(offerEnd)}`,
      "SUMMARY:Abraham's ₦50k Website Offer - Closing Soon!",
      `DESCRIPTION:You saved this reminder for Abraham Akinwumi's ₦50,000 website offer. Only 20 slots. Go to ${PAGE_URL} before time runs out. Or chat Abraham: https://wa.me/${WHATSAPP_NUMBER}`,
      `URL:${PAGE_URL}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "abraham-website-offer-reminder.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={downloadCalendarReminder}
      className={`mt-4 rounded-full border px-5 py-3 font-inter text-sm font-semibold transition hover:brightness-110 ${
        dark ? "border-white/70 text-white" : "border-purple-bright text-purple-bright"
      }`}
    >
      ⏰ Remind Me Before the Offer Ends
    </button>
  );
}

function ExpiredOffer({ compact = false }) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${compact ? "py-6" : "py-12"}`}>
      <h2 className="font-display text-3xl font-bold text-purple-mid md:text-4xl">This Offer Has Closed.</h2>
      <p className="mt-4 font-inter text-base leading-relaxed text-dark-text md:text-lg">
        All 20 slots have been filled or the 48-hour window has ended. Abraham is now building websites at his standard
        rate of ₦350,000.
      </p>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham, I want to ask about a standard website.`}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-7 py-4 font-inter text-base font-semibold uppercase tracking-wide text-white"
      >
        → Chat Abraham About a Standard Website
      </a>
    </div>
  );
}

function CtaButton({ expired, children = "→ Reserve My Slot Now", variant = "orange" }) {
  const reduced = useReducedMotion();
  if (expired) {
    return (
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham, I want to ask about a standard website.`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-full bg-white px-7 py-4 font-inter text-base font-semibold uppercase tracking-wide text-purple-mid"
      >
        → Chat Abraham About a Standard Website
      </a>
    );
  }

  const classes =
    variant === "white"
      ? "bg-white text-purple-mid ring-2 ring-orange-warm"
      : "bg-gradient-to-r from-orange-fire to-orange-warm text-white shadow-xl";

  return (
    <motion.button
      onClick={scrollToForm}
      animate={reduced ? undefined : { scale: [1, 1.03, 1] }}
      whileHover={{ scale: 1.04 }}
      transition={reduced ? { duration: 0 } : { repeat: Infinity, duration: 2 }}
      className={`rounded-full px-7 py-4 font-inter text-base font-semibold uppercase tracking-wide transition hover:brightness-110 ${classes}`}
    >
      {children}
    </motion.button>
  );
}

function SlotProgress({ slotsRemaining }) {
  const filled = ((INITIAL_SLOTS - slotsRemaining) / INITIAL_SLOTS) * 100;
  return (
    <div className="h-3 overflow-hidden rounded-full bg-white/15">
      <div
        className="h-full rounded-full bg-gradient-to-r from-purple-bright to-orange-fire transition-all duration-500"
        style={{ width: `${filled}%` }}
      />
    </div>
  );
}

function UrgencyBar({ slotsRemaining, timeLeft }) {
  return (
    <div className="fixed left-0 top-0 z-[100] flex h-11 w-full items-center justify-center bg-[linear-gradient(90deg,#3D0066,#9333EA,#3D0066)] bg-[length:200%_200%] px-4 font-accent text-sm text-white shadow-lg animate-shimmer">
      <div className="hidden flex-1 items-center gap-2 md:flex">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-dot-pulse" />
        <span>{slotsRemaining} of 20 slots remaining</span>
      </div>
      <div className="flex flex-1 items-center justify-center gap-2 font-bold">
        <span>⚡ OFFER CLOSES IN:</span>
        <CountdownText timeLeft={timeLeft} />
      </div>
      <button onClick={scrollToForm} className="hidden flex-1 justify-end text-right font-semibold text-orange-warm md:flex">
        → Reserve Now
      </button>
    </div>
  );
}

function CountdownBoxes({ timeLeft }) {
  const boxes = [
    ["HH", pad(timeLeft.hours), "Hours"],
    ["MM", pad(timeLeft.minutes), "Minutes"],
    ["SS", pad(timeLeft.seconds), "Seconds"],
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {boxes.map(([unit, value, label]) => (
        <div key={unit} className="rounded-xl bg-dark-text p-3 text-center">
          <div className="font-accent text-4xl font-bold tabular-nums text-orange-warm md:text-5xl">{value}</div>
          <div className="mt-1 font-inter text-xs uppercase text-light-text/70">{label}</div>
        </div>
      ))}
    </div>
  );
}

function SlotCard({ slotsRemaining, timeLeft }) {
  const reduced = useReducedMotion();
  return (
    <div className="rounded-2xl border border-orange-warm/70 bg-purple-mid p-5 shadow-2xl shadow-purple-bright/30">
      <div className="-mx-5 -mt-5 rounded-t-2xl bg-orange-fire px-5 py-3 text-center font-inter text-sm font-bold uppercase tracking-wide text-white">
        Slots Remaining
      </div>
      <motion.div
        key={slotsRemaining}
        animate={reduced ? undefined : { scale: [1, 1.2, 1], color: ["#FFFFFF", "#EA580C", "#FFFFFF"] }}
        transition={{ duration: reduced ? 0 : 0.4 }}
        className="py-6 text-center font-accent text-8xl font-bold text-white"
      >
        {slotsRemaining}
      </motion.div>
      <SlotProgress slotsRemaining={slotsRemaining} />
      <SectionDivider />
      <div className="mt-5 text-center font-inter text-xs uppercase tracking-widest text-light-text/80">Offer closes in</div>
      <div className="mt-3">
        <CountdownBoxes timeLeft={timeLeft} />
      </div>
      <p className="mt-4 text-center font-inter text-sm text-light-text/75">
        After this, price returns to ₦350,000. No exceptions.
      </p>
    </div>
  );
}

function HeroSection({ slotsRemaining, timeLeft }) {
  const reduced = useReducedMotion();
  const item = (delay) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { ease: "easeOut", duration: 0.6, delay },
        };
  const pattern =
    "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FFFFFF' stroke-width='1'%3E%3Cpath d='M40 5L75 40L40 75L5 40Z'/%3E%3Cpath d='M20 20L60 20L60 60L20 60Z'/%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(135deg,#3D0066_0%,#6B21A8_50%,#1A0030_100%)] pt-20 pb-16"
      style={{ backgroundImage: `${pattern}, linear-gradient(135deg,#3D0066 0%,#6B21A8 50%,#1A0030 100%)` }}
    >
      <div className="absolute inset-0 opacity-[0.08]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[3fr_2fr] md:items-center">
        <div>
          <motion.div {...item(0)} className="inline-flex rounded-full bg-orange-fire px-4 py-2 font-inter text-sm font-bold text-white">
            ⚠️ 48 Hours Only · 20 Slots · Personal Offer from Abraham
          </motion.div>
          <motion.h1 {...item(0.15)} className="mt-6 font-display text-4xl font-bold leading-tight text-white md:text-7xl">
            I Want to <span className="italic text-orange-fire">Give</span>
            <br />
            Your Business
            <br />
            a Website.
            <br />
            Not Sell You One.
          </motion.h1>
          <motion.p {...item(0.3)} className="mt-6 max-w-lg font-inter text-base leading-relaxed text-light-text md:text-lg">
            For 48 hours, I'm opening 20 slots to build complete, professional websites for small businesses at ₦50,000.
            This is not a discount. This is me deciding, one more time, to do something I love for people who deserve it
            but can't afford the normal price.
          </motion.p>
          <motion.div {...item(0.38)} className="mt-7 grid max-w-md grid-cols-2 gap-4">
            <div>
              <div className="font-accent text-3xl font-bold text-light-text/50 line-through">₦350,000</div>
              <div className="font-inter text-sm text-light-text/70">Normal Market Price</div>
            </div>
            <div>
              <div className="font-accent text-5xl font-bold text-orange-fire drop-shadow-[0_0_18px_rgba(234,88,12,0.55)]">₦50,000</div>
              <div className="font-inter text-sm text-light-text">Your Price Today</div>
            </div>
          </motion.div>
          <motion.div {...item(0.45)} className="mt-8">
            <CtaButton expired={timeLeft.expired} />
            <p className="mt-3 font-inter text-sm text-light-text/75">Slots are first-come, first-served. Payment locks your slot.</p>
            <CalendarReminderButton dark />
          </motion.div>
          <motion.div {...item(0.6)} className="mt-6 flex flex-wrap gap-3 font-inter text-sm text-light-text">
            <span>✓ No hidden charges</span>
            <span>✓ Built personally by Abraham</span>
            <span>✓ 19 years experience</span>
          </motion.div>
        </div>
        <motion.div {...item(0.6)}>
          <SlotCard slotsRemaining={slotsRemaining} timeLeft={timeLeft} />
        </motion.div>
      </div>
    </section>
  );
}

function AbrahamLetter() {
  const reveal = useReveal();
  return (
    <motion.section {...reveal} className="bg-off-white px-5 py-20">
      <div
        className="mx-auto max-w-2xl rounded-xl px-5 py-8"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, rgba(147,51,234,0.08) 0 1px, transparent 1px 34px)",
        }}
      >
        <div className="font-inter text-sm font-bold uppercase tracking-[0.25em] text-purple-bright">A Personal Note</div>
        <blockquote className="mt-5 font-display text-3xl italic leading-tight text-purple-mid md:text-4xl">
          "I have been building websites for 19 years. In that time, I have met hundreds of business owners who couldn't
          afford one."
        </blockquote>
        <div className="mt-7 space-y-5 font-inter text-base leading-loose text-dark-text md:text-lg">
          <p>
            I have watched brilliant people with real businesses stay invisible because a proper website felt too expensive.
            Tailors, consultants, schools, salons, coaches, food vendors, real estate agents, and small companies doing good
            work, but losing customers to people who simply looked more established online.
          </p>
          <p>
            This offer is my decision to open 20 slots for business owners who are serious, ready, and tired of explaining
            their value without a place to send people. It is not a mass promotion. It is a short personal window.
          </p>
          <p>
            If you have been waiting for the right time, I made this for you. I will build it with care, with the experience
            of nineteen years, and with the understanding that your website is not decoration. It is credibility.
          </p>
        </div>
        <div className="mt-8">
          <div className="font-display text-3xl italic text-purple-mid">- Abraham Akinwumi</div>
          <div className="mt-1 font-inter text-sm text-dark-text/60">Software Developer · 19 Years · Lagos, Nigeria</div>
        </div>
      </div>
    </motion.section>
  );
}

function TransformationSection() {
  const reveal = useReveal();
  const stats = [
    ["81%", "of customers research a business online before contacting them"],
    ["40%", "more revenue growth for businesses with websites vs without"],
    ["100M+", "Nigerian internet users actively searching for services like yours"],
  ];
  return (
    <motion.section {...reveal} className="bg-[linear-gradient(135deg,#3D0066,#1A0030)] px-5 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">What Happens When a Small Business Gets a Real Website</h2>
          <p className="mt-5 font-inter text-base leading-relaxed text-light-text md:text-lg">
            The phone changes. People stop asking if you are serious and start asking how soon you can help them. Your
            business becomes easier to explain, easier to trust, and easier to recommend.
          </p>
          <div className="mt-7 rounded-xl border-l-4 border-orange-fire bg-dark-text/60 p-5 font-display text-xl italic text-white">
            "The day my website went live, I realised I had been hiding my business. Not on purpose, but that was what it
            was. Hiding."
            <div className="mt-3 font-inter text-sm not-italic text-light-text/70">- A client Abraham built a website for</div>
          </div>
        </div>
        <div className="space-y-4">
          {stats.map(([number, label]) => (
            <motion.div
              key={number}
              whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(147,51,234,0.4)" }}
              className="rounded-xl bg-dark-text/70 p-6 shadow-glow"
            >
              <div className="font-accent text-6xl font-bold text-orange-fire">{number}</div>
              <div className="mt-2 font-inter text-white">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function OfferBox({ slotsRemaining, timeLeft }) {
  const reveal = useReveal();
  return (
    <motion.section {...reveal} className="bg-white px-5 py-20">
      <div className="mx-auto grid max-w-3xl gap-8 rounded-3xl border-4 border-purple-mid bg-white p-6 shadow-[0_0_60px_rgba(147,51,234,0.28)] md:grid-cols-2 md:p-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-purple-mid">Your Complete Website - ₦50,000</h2>
          <ul className="mt-6 space-y-3 font-inter text-dark-text">
            {offerItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-green-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-dark-text/60">Every element chosen because it makes websites work, not just look good.</p>
        </div>
        <div className="rounded-2xl bg-off-white p-5">
          <div className="space-y-4 font-inter">
            <div className="flex justify-between gap-4 text-dark-text/60">
              <span>Others charge:</span>
              <span className="line-through">₦350,000 - ₦500,000</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <span className="text-dark-text">Abraham charges:</span>
              <span className="font-accent text-4xl font-bold text-orange-fire">₦50,000</span>
            </div>
            <div className="flex justify-between gap-4 font-bold text-green-700">
              <span>You save:</span>
              <span>₦300,000</span>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-white p-4">
            <div className="font-accent text-xl font-bold text-purple-mid">{slotsRemaining} of 20 slots left</div>
            <div className="mt-2 text-sm text-dark-text/70">
              Closes in <CountdownText timeLeft={timeLeft} />
            </div>
          </div>
          <div className="mt-5">
            <CtaButton expired={timeLeft.expired} />
          </div>
          <a className="mt-4 inline-flex font-inter font-semibold text-purple-bright" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
            Or chat with Abraham first →
          </a>
        </div>
      </div>
    </motion.section>
  );
}

function FOMOSection() {
  const reveal = useReveal();
  const cards = [
    ["🔍", "Someone just searched for what you offer", "bg-purple-mid"],
    ["🏪", "They found your competitor's website", "bg-orange-fire"],
    ["💸", "They bought from them instead", "bg-dark-text"],
  ];
  return (
    <motion.section {...reveal} className="bg-orange-glow/35 px-5 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-display text-3xl font-bold text-dark-text md:text-4xl">Read This Before You Decide to Think About It</h2>
        <p className="mx-auto mt-5 max-w-3xl font-inter text-base leading-relaxed text-dark-text md:text-lg">
          Someone is searching today for exactly what you sell. They do not know your name. They only know the problem
          they need solved. If your business is absent, another business becomes the answer.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map(([icon, text, color]) => (
            <div key={text} className={`rounded-2xl ${color} p-6 text-white shadow-lg`}>
              <div className="text-4xl">{icon}</div>
              <div className="mt-4 font-inter text-lg font-semibold">{text}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 font-display text-3xl italic text-purple-mid">You never knew. You never will.</div>
        <p className="mx-auto mt-6 max-w-3xl font-inter leading-relaxed text-dark-text">
          That is why the slots matter. Abraham can only build a limited number personally, and once the window closes,
          the friendly price closes with it.
        </p>
        <div className="mt-6 font-display text-3xl italic text-orange-fire">"You should have been there when it was open."</div>
      </div>
    </motion.section>
  );
}

function WhoIsThisFor() {
  const reveal = useReveal();
  return (
    <motion.section {...reveal} className="bg-purple-mid px-5 py-20">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <ListCard title="✅ This offer is for you if..." items={forYou} border="border-green-500" />
        <ListCard title="✖ This offer is not for you if..." items={notForYou} border="border-red-500" />
      </div>
    </motion.section>
  );
}

function ListCard({ title, items, border }) {
  return (
    <div className={`rounded-2xl border-l-4 ${border} bg-dark-text/75 p-6 text-white`}>
      <h2 className="font-inter text-xl font-bold">{title}</h2>
      <ul className="mt-5 space-y-3 font-inter text-light-text">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CredibilitySection() {
  const reveal = useReveal();
  const samples = ["Grace Foods", "Prime Tutors", "Lagos Cleaners"];
  return (
    <motion.section {...reveal} className="bg-off-white px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-end justify-center gap-3">
            <span className="font-accent text-8xl font-bold text-orange-fire">19</span>
            <span className="pb-4 font-display text-4xl font-bold text-purple-mid">Years</span>
          </div>
          <p className="mt-4 font-inter text-base leading-relaxed text-dark-text md:text-lg">
            This is not a side hustle, not a weekend hobby, and not a template resold with a new logo. Abraham has spent a
            career building websites that help real businesses become visible, trusted, and easier to buy from.
          </p>
          <div className="mt-8">
            <SectionDivider />
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {samples.map((name, index) => (
            <motion.div key={name} whileHover={{ y: -8 }} className="overflow-hidden rounded-xl bg-white shadow-lg">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-mid to-orange-fire font-accent text-xl font-bold text-white">
                Website Sample {index + 1}
              </div>
              <div className="p-4 font-inter">
                <div className="font-bold text-dark-text">{name}</div>
                <div className="text-sm text-dark-text/60">Small Business · Lagos</div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 grid gap-5 overflow-x-auto md:grid-cols-3">
          {["People started taking us seriously immediately.", "The website made our offer clear in one link.", "Abraham understood the business before touching the design."].map((quote, index) => (
            <motion.div
              key={quote}
              whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(147,51,234,0.4)" }}
              className="min-w-72 rounded-2xl border-l-4 border-purple-mid bg-white p-5 shadow-md"
            >
              <div className="text-5xl text-orange-fire">"</div>
              <p className="font-display text-xl italic text-dark-text">{quote}</p>
              <div className="mt-4 text-orange-fire">★★★★★</div>
              <div className="mt-2 font-inter text-sm text-dark-text/60">Verified client {index + 1}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function FAQSection() {
  const reveal = useReveal();
  const [open, setOpen] = useState(0);
  return (
    <motion.section {...reveal} className="bg-purple-deep px-5 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-3xl font-bold text-white md:text-4xl">Questions Before You Reserve?</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([question, answer], index) => (
            <div key={question} className={`rounded-xl bg-dark-text/70 ${open === index ? "border-l-4 border-purple-bright" : ""}`}>
              <button
                onClick={() => setOpen(open === index ? -1 : index)}
                className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-4 text-left font-inter font-semibold text-white"
              >
                <span>{question}</span>
                <motion.span animate={{ rotate: open === index ? 45 : 0 }} className="text-2xl text-orange-fire">
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 font-inter leading-relaxed text-light-text">{answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function FinalCTA({ slotsRemaining, timeLeft }) {
  const reveal = useReveal();
  return (
    <motion.section
      {...reveal}
      className="bg-[linear-gradient(135deg,#3D0066,#EA580C,#6B21A8)] bg-[length:200%_200%] px-5 py-20 text-center animate-shimmer"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-4xl font-bold text-white md:text-6xl">
          Your Business Has Been
          <br />
          Waiting Long Enough.
        </h2>
        <p className="mt-5 font-inter text-lg leading-relaxed text-light-text">
          The businesses that grow are not always the best ones. They are the ones that said yes when the window was open.
        </p>
        <div className="mt-7 font-accent text-3xl font-bold text-orange-warm">🔴 {slotsRemaining} of 20 slots remaining</div>
        <div className="mt-3 text-2xl font-bold">
          <CountdownText timeLeft={timeLeft} />
        </div>
        <div className="mt-8">
          <CtaButton expired={timeLeft.expired} variant="white">
            → Reserve My Slot. ₦50,000. 48 Hours.
          </CtaButton>
          <p className="mt-4 font-inter text-sm text-light-text">
            Fill the form below. Your slot is held for 30 minutes after submission. Payment locks it permanently.
          </p>
          <CalendarReminderButton dark />
        </div>
      </div>
    </motion.section>
  );
}

function ReservationForm({ expired }) {
  const reveal = useReveal();
  const [tab, setTab] = useState("card");
  const [payStatus, setPayStatus] = useState("");
  const tabs = [
    ["card", "Card"],
    ["transfer", "Bank Transfer"],
    ["opay", "Opay"],
  ];

  const handlePaystackPayment = async () => {
    setPayStatus("Opening secure Paystack checkout...");
    try {
      const module = await import("@paystack/inline-js");
      const PaystackPop = module.default || module.PaystackPop;
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: "[YOUR_PAYSTACK_PUBLIC_KEY]",
        email: "customer@example.com",
        amount: 5000000,
        currency: "NGN",
        ref: `ABRAHAM_${Date.now()}`,
        metadata: { name: "[from form]", business: "[from form]", phone: "[from form]" },
        onSuccess: (transaction) => {
          setPayStatus("Payment received. Opening WhatsApp confirmation...");
          window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=I just paid for my website slot! Transaction ref: ${transaction.reference}`,
            "_blank",
          );
        },
        onCancel: () => setPayStatus("Checkout closed. You can retry when you're ready."),
      });
    } catch (error) {
      setPayStatus("Paystack could not load. Please use Transfer or Opay, or check the public key.");
    }
  };

  if (expired) {
    return (
      <section id="reservation-form" className="bg-off-white px-5 py-20">
        <ExpiredOffer />
      </section>
    );
  }

  return (
    <motion.section {...reveal} id="reservation-form" className="bg-off-white px-5 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-display text-3xl font-bold text-purple-mid md:text-4xl">Reserve Your Slot Now</h2>
        <p className="mt-3 text-center font-inter text-sm font-semibold text-orange-fire">
          ⏱ Your slot is not confirmed until this form is submitted. Slots go in the order payment is received.
        </p>
        {/*
          FLUENT FORMS EMBED
          Replace the div below with your WordPress Fluent Forms embed code.
          The form should collect: Full Name, Business Name, Business Description,
          City/State, WhatsApp Number, Email, and "Do you currently have a website?"
          Ensure the form's submit button is styled to match: orange gradient, rounded-full.
        */}
        <div id="fluent-form-embed" className="mt-8 flex min-h-64 w-full items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50">
          <p className="font-inter text-sm text-purple-400">[ Fluent Forms Embed Goes Here ]</p>
        </div>
        <div className="mt-10 rounded-2xl bg-white p-5 shadow-lg">
          <h3 className="font-inter text-xl font-semibold text-purple-mid">Choose How to Pay Your ₦50,000</h3>
          <div className="mt-5 flex gap-2 overflow-x-auto rounded-full bg-off-white p-1">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                data-testid={`payment-tab-${id}`}
                onClick={() => setTab(id)}
                className={`min-w-max flex-1 rounded-full px-4 py-3 font-inter text-sm font-bold transition ${
                  tab === id ? "bg-purple-mid text-white" : "text-purple-mid"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "card" && (
            <div className="mt-6">
              {/*
                PAYSTACK INLINE INTEGRATION
                Install: npm install @paystack/inline-js
                Replace the placeholder key and wire email/name/business/phone from Fluent Forms or mirrored form state.
              */}
              <button
                onClick={handlePaystackPayment}
                className="w-full rounded-full bg-gradient-to-r from-orange-fire to-orange-warm py-4 font-inter text-lg font-semibold text-white transition hover:brightness-110"
              >
                → Pay ₦50,000 with Card (Paystack)
              </button>
              {payStatus && <p className="mt-3 text-center font-inter text-sm text-dark-text/70">{payStatus}</p>}
            </div>
          )}
          {tab === "transfer" && <TransferPayment />}
          {tab === "opay" && <OpayPayment />}
        </div>
      </div>
    </motion.section>
  );
}

function TransferPayment() {
  return (
    <div className="mt-6 rounded-2xl bg-off-white p-5 font-inter text-dark-text">
      <div className="text-sm uppercase tracking-widest text-purple-bright">Bank transfer details</div>
      <div className="mt-3 rounded-xl bg-white p-4 font-accent text-xl font-bold text-purple-mid">
        [BANK NAME] | [ACCOUNT NUMBER] | Abraham Akinwumi
      </div>
      <p className="mt-4">After transfer, send your payment proof to Abraham on WhatsApp to confirm your slot immediately.</p>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=I have made a bank transfer for my website slot. Here is my proof:`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-6 py-3 font-semibold text-white"
      >
        → Send Proof on WhatsApp
      </a>
    </div>
  );
}

function OpayPayment() {
  return (
    <div className="mt-6 rounded-2xl bg-off-white p-5 font-inter text-dark-text">
      <div id="opay-qr-placeholder" data-testid="opay-qr-placeholder" className="mx-auto flex aspect-square max-w-64 items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-white p-6 text-center text-purple-400">
        [PLACEHOLDER: Opay QR Code Image - replace with actual QR]
      </div>
      <p className="mt-4">After Opay payment, send your payment proof to Abraham on WhatsApp to confirm your slot immediately.</p>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=I have made an Opay payment for my website slot. Here is my proof:`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-6 py-3 font-semibold text-white"
      >
        → Send Proof on WhatsApp
      </a>
    </div>
  );
}

function PostFormReassurance() {
  const reveal = useReveal();
  const pillars = [
    ["🏆", "19 Years of Experience", "Not a side hustle. The craft of a career."],
    ["🛡️", "Built Personally by Abraham", "No outsourcing. No templates. Your website, made by hand."],
    ["💬", "He Answers His Own Messages", "Questions? He replies himself. Not a bot. Not a team. Abraham."],
  ];
  return (
    <motion.section {...reveal} className="bg-purple-deep px-5 py-16">
      <div className="mx-auto grid max-w-5xl gap-5 text-center md:grid-cols-3">
        {pillars.map(([icon, title, text]) => (
          <div key={title} className="rounded-2xl bg-white/10 p-6 text-white">
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-4 font-inter text-xl font-bold">{title}</h3>
            <p className="mt-2 font-inter text-light-text/80">{text}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function WhatsAppWidget() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham, I saw your ₦50,000 website offer and I have a question.`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Abraham on WhatsApp"
      className="group fixed bottom-5 right-5 z-[999] flex h-[60px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ring-pulse" />
      <span className="pointer-events-none absolute right-14 hidden whitespace-nowrap rounded-full bg-dark-text px-4 py-2 font-inter text-sm font-semibold shadow-lg transition md:group-hover:block">
        Chat with Abraham
      </span>
      <svg className="relative h-8 w-8" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3.2A12.78 12.78 0 0 0 5.1 22.6L3.5 28.8l6.35-1.66A12.78 12.78 0 1 0 16.04 3.2Zm0 23.35a10.55 10.55 0 0 1-5.38-1.47l-.38-.23-3.76.98 1-3.66-.25-.38a10.56 10.56 0 1 1 8.77 4.76Zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.35-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}

function Footer() {
  return (
    <footer className="bg-dark-text px-5 py-10 text-center font-inter text-sm text-light-text/75">
      <div>© Abraham Akinwumi | Website Developer | 19 Years Experience</div>
      <div className="mt-2">Built websites that have grown businesses across Nigeria.</div>
      <div className="mt-2">WhatsApp: +2348182126524 · Email: [PLACEHOLDER EMAIL]</div>
      <div className="mx-auto mt-4 max-w-2xl text-xs text-light-text/45">
        This is a personal, one-time, 48-hour offer. 20 slots total. First paid, first served. After the timer ends, price
        returns to ₦350,000.
      </div>
    </footer>
  );
}

export default function App() {
  const [slotsRemaining, setSlotsRemaining] = useState(INITIAL_SLOTS);
  const timeLeft = useCountdown(OFFER_END_DATE);

  useEffect(() => {
    // Replace this with a backend fetch later, e.g. GET /api/offer-slots.
    const timer = setTimeout(() => setSlotsRemaining((prev) => Math.max(prev - 1, 0)), 8000);
    return () => clearTimeout(timer);
  }, []);

  const expired = timeLeft.expired;
  const shared = useMemo(() => ({ slotsRemaining, timeLeft }), [slotsRemaining, timeLeft]);

  return (
    <main className="min-h-screen bg-off-white font-inter text-dark-text">
      <UrgencyBar {...shared} />
      <HeroSection {...shared} />
      {expired ? <ExpiredOffer /> : null}
      <AbrahamLetter />
      <TransformationSection />
      <OfferBox {...shared} />
      <FOMOSection />
      <WhoIsThisFor />
      <CredibilitySection />
      <FAQSection />
      <FinalCTA {...shared} />
      <ReservationForm expired={expired} />
      <PostFormReassurance />
      <Footer />
      <WhatsAppWidget />
    </main>
  );
}
