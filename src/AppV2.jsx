import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FLUENT_FORMS_URL, INITIAL_SLOTS, OFFER_END_DATE, WHATSAPP_NUMBER } from "./constants";
import { OFFER_END_COPY, OFFER_END_SHORT } from "./utils/formatDate";
import { getSmartTimeLabel } from "./utils/getTimeLabel";
import { decrementRemoteSlot, fetchSlotsRemaining, getSlotsRemaining } from "./utils/slots";
import ReminderButton from "./components/ReminderButton";

const easeOut = [0.22, 1, 0.36, 1];

const revealUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: easeOut },
};

const faqs = [
  ["Is ₦50,000 really the full price?", "Yes. For this window, it covers the complete website package listed here. No hidden setup charge is added."],
  ["Will Abraham build it personally?", "Yes. Abraham reviews your business, plans your pages, and builds the website himself."],
  ["How long will my website take?", "After payment and content confirmation, Abraham will agree a practical timeline with you on WhatsApp."],
  ["Do I need to already have a domain?", "No. Domain and hosting are included in this package, with the final name confirmed after your slot is paid."],
  ["Can I pay after the website is done?", "No. The slot is confirmed by payment because only 20 spaces are available."],
  ["What happens after the offer closes?", "The offer closes and the standard website price returns to ₦350,000. The countdown is fixed and does not reset."],
  ["How do I know my slot is actually reserved?", "Your form submission holds it for 30 minutes. Payment confirms it permanently. Abraham sends a WhatsApp message to confirm."],
  ["What if I'm outside Lagos?", "Abraham builds websites remotely. Location does not matter. He works with businesses across Nigeria."],
];

const offerItems = [
  "Full website with up to 10 pages",
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

const testimonials = [
  {
    quote: "Abraham is the GURU when it comes to anything website and tech.... <br>His delivery is so excellent and impeccable that I make so much money working with him because he delivers a 100%. Anything Website, I highly highly recommend  Abraham because he is so good at what he does.... His teachings, his prompt response to any complaints, his services and delivery is the best and it is top notch! Tech Bro as I always call you, you are so good at what you do, no caps!!! I always recommend him to my clients all the time! If you are looking for someone to train you on website design, teach you or even handle anything related to website, I highly recommend Abraham Akomolafe and i believe EVERYONE should work with the best and he is the BEST in this field!!!",
    name: "Winner Ezekiel",
    business: "Millenial CEOs",
    city: "Lagos",
    image: "/images/winner-ezekiel.jpg",
  },
  {
    quote: "Before I built my website, my business was doing considerably well, but after my friend ecouraged me to have a website and introduced me to Abraham, I am glad that I made the website through Abraham. I realised that though I was doing well, I was leaving a lot of money on the table by not having a website. Having a website launched our business into reaching a new level of people that we wouldn't have been able to reach without a good website.  A lot of people found me by searching for my service online, there is a thing that a good website does, it makes customers see you as more valuable and this helped me close deals faster now",
    name: "Chime Joshua",
    business: "Genius Quest Hub",
    city: "UK",
    image: "/images/chime-joshua-genius-quest-hub.jpg",
  },
  /*{
    quote: "The day my website went live, I realised I had been hiding my business. Abraham understood exactly what I needed and delivered something that made my business look like what it truly is.",
    name: "[Client Name]",
    business: "[Business Name]",
    city: "[City]",
  },
  */
];

const WEBSITE_SAMPLES = [
  { name: "Genius Quest Hub", url: "https://geniusquesthub.com", category: "Education", location: "UK", image: "/images/genius-quest-hub.webp" },
  { name: "Skills Air", url: "https://skillsair.com", category: "EdTech", location: "Lagos, Nigeria", image: "/images/skills-air.png" },
  { name: "Bezal Homes", url: "https://bezalhomes.ng", category: "Real Estate", location: "Lagos, Nigeria", image: "/images/bezal-homes.png" },
];

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate - new Date();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
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

function useSmartLabel() {
  const [label, setLabel] = useState(() => getSmartTimeLabel(OFFER_END_DATE));
  useEffect(() => {
    const interval = setInterval(() => setLabel(getSmartTimeLabel(OFFER_END_DATE)), 1000);
    return () => clearInterval(interval);
  }, []);
  return label;
}

function useCountUp(target, duration = 1600) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView({ once: true });
  const [count, setCount] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [duration, inView, reduced, target]);

  return { ref, count };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function scrollToForm() {
  scrollToId("reservation-form");
}

function CountdownText({ timeLeft }) {
  const parts = timeLeft.days > 0
    ? [pad(timeLeft.days), pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)]
    : [pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)];

  return <span className="whitespace-nowrap tabular-nums text-orange-warm">{parts.join(":")}</span>;
}

function CtaButton({ expired, children = "→ Reserve My Slot Now", variant = "orange" }) {
  const reduced = useReducedMotion();
  if (expired) {
    return (
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham, I want to ask about a standard website.`} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-white px-8 py-4 text-base font-semibold uppercase tracking-[0.04em] text-purple-mid">
        → Chat Abraham About a Standard Website
      </a>
    );
  }

  return (
    <motion.button
      onClick={scrollToForm}
      animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
      whileHover={{ scale: 1.03, y: -2, boxShadow: "0 12px 40px rgba(234,88,12,0.4)" }}
      transition={reduced ? { duration: 0 } : { repeat: Infinity, duration: 2.5 }}
      className={`cta-button rounded-full px-10 py-4 text-base font-semibold uppercase tracking-[0.04em] transition ${variant === "white" ? "bg-white text-purple-mid ring-2 ring-orange-warm" : "bg-gradient-to-r from-orange-fire to-orange-warm text-white shadow-xl"}`}
    >
      {children}
    </motion.button>
  );
}

function UrgencyBar({ slotsRemaining, timeLeft }) {
  const reduced = useReducedMotion();
  const smartLabel = useSmartLabel();
  return (
    <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.6 }} className="fixed left-0 top-0 z-[100] flex min-h-11 w-full items-center justify-center bg-[linear-gradient(90deg,#3D0066,#9333EA,#3D0066)] bg-[length:200%_200%] px-3 py-1.5 text-xs font-semibold text-white shadow-lg animate-shimmer sm:px-4 sm:text-sm">
      <div className="hidden flex-1 items-center gap-2 md:flex">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-dot-pulse" />
        <span>{slotsRemaining} of 20 slots remaining · {smartLabel}</span>
      </div>
      <div className="flex flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center leading-tight">
        <span>⚡ OFFER CLOSES:</span>
        <CountdownText timeLeft={timeLeft} />
        <span className="hidden text-white/70 sm:inline">· {OFFER_END_SHORT}</span>
      </div>
      <button onClick={scrollToForm} className="hidden flex-1 justify-end text-right text-orange-warm md:flex">→ Reserve Now</button>
    </motion.div>
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [
    { label: "FAQs", target: "faq-section" },
    { label: "Reserve My Slot", target: "reservation-form", highlight: true },
    { label: "50k Website Features", target: "offer-box" },
    { label: "Website Samples", target: "website-samples" },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const goTo = (id) => {
    scrollToId(id);
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed left-0 right-0 top-[3.25rem] z-[90] border-b border-purple-bright/30 backdrop-blur-xl transition sm:top-11 ${scrolled ? "bg-purple-deep/95" : "bg-purple-deep/85"}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <span className="text-base font-bold text-white tracking-[-0.01em]">Abraham<span className="text-orange-fire">.</span></span>
        <div className="desktop-nav flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => goTo(item.target)}
              className={`rounded-lg px-3.5 py-2 text-sm transition hover:bg-purple-bright/20 hover:text-white ${item.highlight ? "rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-5 font-semibold text-white" : "font-medium text-light-text/85"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="mobile-nav-toggle hidden rounded-lg border border-purple-bright/50 px-3 py-2 text-lg text-white" onClick={() => setMobileOpen((value) => !value)}>
          {mobileOpen ? "×" : "☰"}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-purple-bright/20 bg-purple-deep/95 px-6 py-4">
          {navItems.map((item) => (
            <button key={item.target} onClick={() => goTo(item.target)} className={`block w-full border-b border-purple-bright/10 py-3 text-left text-base ${item.highlight ? "font-semibold text-orange-warm" : "text-light-text/90"}`}>
              {item.highlight ? "→ " : ""}{item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

function CountdownBoxes({ timeLeft }) {
  const boxes = timeLeft.days > 0
    ? [["DAYS", pad(timeLeft.days)], ["HRS", pad(timeLeft.hours)], ["MIN", pad(timeLeft.minutes)], ["SEC", pad(timeLeft.seconds)]]
    : [["HRS", pad(timeLeft.hours)], ["MIN", pad(timeLeft.minutes)], ["SEC", pad(timeLeft.seconds)]];
  return (
    <div className={`mx-auto grid gap-2 sm:flex sm:max-w-none sm:items-center sm:justify-center ${timeLeft.days > 0 ? "max-w-[22rem] grid-cols-2" : "max-w-[18rem] grid-cols-3"}`}>
      {boxes.map(([label, value], index) => (
        <React.Fragment key={label}>
          {index > 0 && <span className="hidden text-4xl font-bold text-orange-fire sm:inline">:</span>}
          <div className="rounded-xl border border-orange-fire/30 bg-black/40 px-3 py-3 text-center sm:px-4">
            <div className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tabular-nums text-orange-warm">{value}</div>
            <div className="mt-2 text-[0.7rem] uppercase tracking-[0.12em] text-light-text">{label}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function SlotProgress({ slotsRemaining }) {
  const filled = ((INITIAL_SLOTS - slotsRemaining) / INITIAL_SLOTS) * 100;
  return (
    <div className="h-2 overflow-hidden rounded bg-white/10">
      <div className="h-full rounded bg-gradient-to-r from-purple-bright to-orange-fire transition-all duration-700" style={{ width: `${filled}%` }} />
    </div>
  );
}

function SlotCard({ slotsRemaining, timeLeft }) {
  const reduced = useReducedMotion();
  return (
    <motion.div initial={reduced ? false : { opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : 0.8, ease: easeOut, delay: 0.3 }} className="overflow-hidden rounded-[24px] border border-purple-bright/40 bg-purple-deep/75 p-6 shadow-[0_0_60px_rgba(147,51,234,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl md:p-10">
      <div className="-mx-6 -mt-6 bg-orange-fire px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white md:-mx-10 md:-mt-10">Slots Remaining</div>
      <motion.div key={slotsRemaining} animate={reduced ? undefined : { scale: [1, 1.3, 1], color: ["#FFFFFF", "#EA580C", "#FFFFFF"] }} transition={{ duration: reduced ? 0 : 0.45 }} className="py-7 text-center text-[clamp(5rem,12vw,8rem)] font-bold leading-none text-white">{slotsRemaining}</motion.div>
      <SlotProgress slotsRemaining={slotsRemaining} />
      <div className="my-7 h-px bg-purple-bright/30" />
      <div className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-orange-warm">Offer closes in</div>
      <CountdownBoxes timeLeft={timeLeft} />
      <p className="mt-5 text-center text-sm leading-relaxed text-light-text/80">Offer ends {OFFER_END_COPY} at midnight. No exceptions.</p>
    </motion.div>
  );
}

function HeroSection({ slotsRemaining, timeLeft }) {
  const reduced = useReducedMotion();
  const smartLabel = useSmartLabel();
  const item = (delay) => reduced ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: easeOut, delay } };

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0 bg-cover bg-[center_top] bg-no-repeat" style={{ backgroundImage: "url('/images/header-bg.png')" }} />
      <div className="absolute inset-0 z-[1] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/header-layer.png')" }} />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,rgba(61,0,102,0.88)_0%,rgba(61,0,102,0.54)_55%,rgba(26,0,48,0.38)_100%)]" />
      <div className="relative z-[2] mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-[132px] md:min-h-screen md:grid-cols-[55fr_45fr] md:items-center">
        <div className="hero-left-column">
          <motion.div {...item(0)} className="pre-badge inline-flex flex-wrap justify-center rounded-full bg-orange-fire px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white">
            <span>⚠️ {smartLabel}</span><span className="mx-2 text-white/60">·</span><span>20 Slots</span><span className="mx-2 text-white/60">·</span><span>A Personal Offer from Abraham</span>
          </motion.div>
          <motion.h1 {...item(0.15)} className="mt-6 max-w-3xl text-[clamp(3rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-white">
            I Want to <span className="italic text-orange-fire drop-shadow-[0_0_30px_rgba(234,88,12,0.6)]">Give</span><br />Your Business a Website.<br />
            <span className="text-[1.2rem] font-normal tracking-normal text-light-text md:text-2xl">Not sell you one.</span>
          </motion.h1>
          <motion.div {...item(0.3)} className="hero-subtext-box relative mt-4 mb-2 inline-block rounded-xl border border-transparent bg-[linear-gradient(#1A0030,#1A0030)_padding-box,linear-gradient(135deg,#9333EA,#EA580C,#9333EA)_border-box] px-7 py-5 shadow-[inset_0_0_30px_rgba(147,51,234,0.08),0_4px_20px_rgba(0,0,0,0.2)]">
            <span className="absolute -left-px -top-px h-4 w-4 rounded-tl-sm border-l-[3px] border-t-[3px] border-orange-fire" />
            <span className="absolute -bottom-px -right-px h-4 w-4 rounded-br-sm border-b-[3px] border-r-[3px] border-orange-fire" />
            <p className="m-0 max-w-[480px] text-[1.0625rem] leading-[1.75] text-light-text">
              Until {OFFER_END_SHORT}, I'm opening 20 slots to build complete, professional websites for small businesses at ₦50,000. Not a discount. A genuine decision to help businesses that deserve a proper website but couldn't afford one.
            </p>
          </motion.div>
          <motion.div {...item(0.45)} className="mt-7 grid max-w-md grid-cols-2 gap-5">
            <div><div className="text-xl font-medium text-light-text/45 line-through">₦350,000</div><div className="mt-1 text-xs uppercase tracking-[0.12em] text-light-text/80">Normal Market Price</div></div>
            <div><div className="text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-orange-fire drop-shadow-[0_0_20px_rgba(234,88,12,0.5)]">₦50,000</div><div className="mt-1 text-xs uppercase tracking-[0.12em] text-orange-warm">Your Price Today</div></div>
          </motion.div>
          <motion.div {...item(0.6)} className="mt-8"><CtaButton expired={timeLeft.expired} /><p className="mt-3 text-sm text-light-text/80">Slots go in the order payment is received.</p><ReminderButton dark /></motion.div>
          <motion.div {...item(0.75)} className="trust-row mt-6 flex flex-wrap gap-x-3 gap-y-2 text-sm text-light-text">
            <span>✓ No hidden charges</span><span className="hidden text-light-text/50 sm:inline">·</span><span>✓ Built personally by Abraham</span><span className="hidden text-light-text/50 sm:inline">·</span><span>✓ 19 years experience</span>
          </motion.div>
        </div>
        <SlotCard slotsRemaining={slotsRemaining} timeLeft={timeLeft} />
      </div>
    </section>
  );
}

function AbrahamLetter() {
  const reduced = useReducedMotion();
  return (
    <section className="bg-off-white px-5 py-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(147, 51, 234, 0.06) 27px, rgba(147, 51, 234, 0.06) 28px)" }}>
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[40fr_60fr] md:items-center">
        <motion.div initial={reduced ? false : { opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: reduced ? 0 : 0.8, ease: easeOut }} className="relative mx-auto w-full max-w-[280px] md:max-w-[420px]">
          <img src="/images/abraham-akinwumi.jpg" alt="Abraham Akinwumi" className="relative z-10 aspect-square w-full rounded-full border-[3px] border-purple-bright/30 object-cover shadow-[0_30px_80px_rgba(61,0,102,0.4)] md:aspect-[3/4] md:rounded-[24px]" />
          <div className="absolute -bottom-5 -right-5 z-20 rounded-2xl bg-gradient-to-br from-orange-fire to-orange-warm px-5 py-4 text-center shadow-[0_12px_40px_rgba(234,88,12,0.4)]"><div className="text-[2.5rem] font-bold leading-none text-white">19</div><div className="text-xs font-medium uppercase tracking-[0.1em] text-white/90">Years</div></div>
          <div className="absolute -left-4 -top-4 z-0 h-[calc(100%+30px)] w-[calc(100%+30px)] rounded-[32px] border-2 border-purple-bright/20" />
        </motion.div>
        <motion.div initial={reduced ? false : { opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: reduced ? 0 : 0.8, ease: easeOut }}>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-purple-bright">A Personal Note</div>
          <blockquote className="mt-5 text-[clamp(1.1rem,4vw,2.2rem)] font-bold leading-tight text-purple-mid">"I have been building websites for 19 years. In that time, I have met hundreds of business owners who couldn't afford one."</blockquote>
          <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.75] text-dark-text">
            <p>I have watched brilliant people with real businesses stay invisible because a proper website felt too expensive. Small companies doing good work, but losing customers to people who simply looked more established online.</p>
            <p>This offer is my decision to open 20 slots for business owners who are serious, ready, and tired of explaining their value without a place to send people. It is not a mass promotion. It is a short personal window.</p>
            <p>If you have been waiting for the right time, I made this for you. I will build it with care, with nineteen years of experience, and with the understanding that your website is not decoration. It is credibility.</p>
          </div>
          <div className="mt-8"><div className="text-3xl font-bold text-purple-mid">- Abraham Akinwumi</div><div className="mt-1 text-sm text-dark-text/60">Software Developer · 19 Years · Lagos, Nigeria</div></div>
        </motion.div>
      </div>
    </section>
  );
}

function TransformationSection() {
  return (
    <motion.section {...revealUp} className="bg-[linear-gradient(135deg,#3D0066,#1A0030)] px-5 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        <div><h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white">What Happens When a Small Business Gets a Real Website</h2><p className="mt-5 text-[1.0625rem] leading-[1.75] text-light-text">The phone changes. People stop asking if you are serious and start asking how soon you can help them. Your business becomes easier to explain, easier to trust, and easier to recommend.</p><div className="mt-7 rounded-xl border-l-4 border-orange-fire bg-dark-text/60 p-5 text-xl italic leading-relaxed text-white">"Before I built my website, my business was doing considerably well, but after my friend ecouraged me to have a website and introduced me to Abraham, I am glad that I made the website through Abraham. I realised that though I was doing well, I was leaving a lot of money on the table by not having a website..."<div className="mt-3 text-sm not-italic text-light-text/70">- A client Abraham built a website for</div></div></div>
        <div className="grid gap-4"><TransformationStat number={81} suffix="%" label="of customers research a business online before contacting them" /><TransformationStat number={40} suffix="%" label="more revenue growth for businesses with websites vs without" /><TransformationStat number={100} suffix="M+" label="Nigerian internet users actively searching for services like yours" /></div>
      </div>
    </motion.section>
  );
}

function TransformationStat({ number, suffix, label }) {
  const { ref, count } = useCountUp(number);
  return <motion.div ref={ref} whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(147,51,234,0.4)" }} className="rounded-xl bg-dark-text/70 p-6 shadow-glow"><div className="text-[clamp(3rem,8vw,6rem)] font-bold leading-none tracking-[-0.03em] text-orange-fire">{count}{suffix}</div><div className="mt-2 text-white">{label}</div></motion.div>;
}

function OfferBox({ slotsRemaining, timeLeft }) {
  return (
    <motion.section {...revealUp} id="offer-box" className="bg-white px-5 py-20 scroll-mt-28">
      <div className="mx-auto grid max-w-3xl gap-8 rounded-3xl border-4 border-purple-mid bg-white p-6 shadow-[0_0_60px_rgba(147,51,234,0.28)] md:grid-cols-2 md:p-8">
        <div><h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-purple-mid">Your Complete Website - ₦50,000</h2><motion.ul initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="mt-6 space-y-3 text-dark-text">{offerItems.map((item) => <motion.li key={item} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex gap-3"><span className="text-green-600">✓</span><span>{item}</span></motion.li>)}</motion.ul><p className="mt-6 text-sm text-dark-text/60">Every element chosen because it makes websites work, not just look good.</p><p className="mt-3 font-semibold text-orange-fire">This ₦50,000 price expires {OFFER_END_SHORT}.</p></div>
        <div className="rounded-2xl bg-off-white p-5"><div className="space-y-4"><div className="flex justify-between gap-4 text-dark-text/60"><span>Others charge:</span><span className="line-through">₦350,000 - ₦500,000</span></div><div className="flex items-end justify-between gap-4"><span>Abraham charges:</span><span className="text-4xl font-bold text-orange-fire">₦50,000</span></div><div className="flex justify-between gap-4 font-bold text-green-700"><span>You save:</span><span>₦300,000</span></div></div><div className="mt-6 rounded-xl bg-white p-4"><div className="text-xl font-bold text-purple-mid">{slotsRemaining} of 20 slots left</div><div className="mt-2 text-sm text-dark-text/70">Closes in <CountdownText timeLeft={timeLeft} /></div></div><div className="mt-5"><CtaButton expired={timeLeft.expired} /></div>{/*<a className="mt-4 inline-flex font-semibold text-purple-bright" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">Or chat with Abraham first →</a>*/}</div>
      </div>
    </motion.section>
  );
}

function FOMOSection() {
  const cards = [["🔍", "Someone just searched for what you offer", "bg-purple-mid"], ["🏪", "They found your competitor's website", "bg-orange-fire"], ["💸", "They bought from them instead", "bg-dark-text"]];
  return <motion.section {...revealUp} className="bg-orange-glow/35 px-5 py-20"><div className="mx-auto max-w-5xl text-center"><h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-dark-text">Read This Before You Decide to Think About It</h2><p className="mx-auto mt-5 max-w-3xl text-[1.0625rem] leading-[1.75] text-dark-text">Someone is searching today for exactly what you sell. If your business is absent, another business becomes the answer.</p><motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.15 } } }} className="mt-10 grid gap-4 md:grid-cols-3">{cards.map(([icon, text, color]) => <motion.div key={text} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} className={`rounded-2xl ${color} p-6 text-white shadow-lg`}><div className="text-4xl">{icon}</div><div className="mt-4 text-lg font-semibold">{text}</div></motion.div>)}</motion.div><div className="mt-8 text-3xl font-bold italic text-purple-mid">You never knew. You never will.</div><div className="mt-6 text-3xl font-bold italic text-orange-fire">"You should have been there when it was open."</div></div></motion.section>;
}

function WhoIsThisFor() {
  return <section className="bg-purple-mid px-5 py-20"><div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2"><ListCard title="✅ This offer is for you if..." border="border-green-500" items={["You run a real small business and need people to trust you online.", "You delayed getting a website because the usual price felt too high.", "You are ready to send your business details and respond quickly.", "You want a professional web presence, not a cheap-looking page."]} /><ListCard title="✖ This offer is not for you if..." border="border-red-500" items={["You want a complex app, marketplace, or custom software system.", "You are not ready to pay and confirm your slot within the window.", "You want Abraham to copy another brand exactly.", "You are looking for endless revisions without clear direction."]} /></div></section>;
}

function ListCard({ title, items, border }) {
  return <motion.div {...revealUp} className={`rounded-2xl border-l-4 ${border} bg-dark-text/75 p-6 text-white`}><h2 className="text-xl font-bold">{title}</h2><ul className="mt-5 space-y-3 text-light-text">{items.map((item) => <li key={item}>{item}</li>)}</ul></motion.div>;
}

function WebsiteSampleCard({ sample }) {
  const [isActive, setIsActive] = useState(false);

  const startScrolling = () => setIsActive(true);
  const stopScrolling = () => setIsActive(false);

  return (
    <div
      className={`relative h-80 cursor-pointer overflow-hidden rounded-2xl border-2 bg-white transition ${isActive ? "border-orange-fire shadow-[0_20px_60px_rgba(147,51,234,0.35)]" : "border-purple-bright/15 shadow-[0_8px_30px_rgba(61,0,102,0.12)]"}`}
      onMouseEnter={startScrolling}
      onMouseLeave={stopScrolling}
      onTouchStart={startScrolling}
      onTouchEnd={stopScrolling}
      onFocus={startScrolling}
      onBlur={stopScrolling}
      tabIndex={0}
      role="img"
      aria-label={`Preview of ${sample.name} website`}
    >
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={sample.image}
          alt={`${sample.name} website preview`}
          className="w-full object-cover object-top transition-transform"
          style={{
            transform: isActive ? "translateY(-30%)" : "translateY(0)",
            transition: isActive ? "transform 10s linear" : "transform 0.5s ease",
          }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(61,0,102,0.95)_0%,rgba(61,0,102,0.6)_70%,transparent_100%)] px-4 pb-4 pt-10">
        <div className="font-semibold text-white">{sample.name}</div>
        <div className="text-sm text-orange-warm">{sample.category} - {sample.location}</div>
        <div className="text-xs text-white/60">{sample.url}</div>
      </div>
      {!isActive && <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-orange-fire/40 bg-purple-deep/70 px-4 py-2 text-sm font-medium text-white backdrop-blur">Hover to preview</div>}
    </div>
  );
}

function CredibilitySection() {
  const years = useCountUp(19);
  return (
    <motion.section {...revealUp} id="website-samples" className="bg-off-white px-5 py-20 scroll-mt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div ref={years.ref} className="flex items-end justify-center gap-3"><span className="text-8xl font-bold text-orange-fire">{years.count}</span><span className="pb-4 text-4xl font-bold text-purple-mid">Years</span></div>
          <p className="mt-4 text-[1.0625rem] leading-[1.75] text-dark-text">This is not a side hustle, not a weekend hobby, and not a template resold with a new logo. Abraham has spent a career building websites that help real businesses become visible, trusted, and easier to buy from.</p>
          <div className="mx-auto mt-8 h-px w-full max-w-xl bg-[linear-gradient(90deg,transparent,#9333EA,transparent)]" />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{WEBSITE_SAMPLES.map((sample) => <WebsiteSampleCard key={sample.name} sample={sample} />)}</div>
      </div>
    </motion.section>
  );
}

function TestimonialsSection() {
  return <section className="bg-[linear-gradient(180deg,#FDF4FF_0%,#F3E8FF_100%)] px-5 py-20"><div className="mx-auto max-w-6xl"><motion.div {...revealUp} className="text-center"><div className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-fire">What Our Clients Say</div><h2 className="mt-3 text-[clamp(1.8rem,4vw,3rem)] font-bold text-dark-text">Real Businesses. Real Results.</h2></motion.div><div className="mt-10"><Swiper modules={[Autoplay, Pagination, Navigation]} spaceBetween={30} slidesPerView={1} autoplay={{ delay: 5000, disableOnInteraction: false }} pagination={{ clickable: true }} navigation loop>{testimonials.map((testimonial, index) => <SwiperSlide key={testimonial.quote}><TestimonialCard testimonial={testimonial} index={index} /></SwiperSlide>)}</Swiper></div><StatsBar /></div></section>;
}

function TestimonialCard({ testimonial, index }) {
  const initial = testimonial.name.replace("[", "").trim().charAt(0) || "C";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }} className="grid min-h-[400px] overflow-hidden rounded-[24px] shadow-[0_20px_60px_rgba(61,0,102,0.15)] md:grid-cols-[55fr_45fr]">
      <div className="flex flex-col justify-between bg-purple-deep p-7 md:p-12">
        <div className="text-8xl font-bold leading-none text-orange-fire/80">"</div>
        <p className="mb-8 flex-1 text-[1.1rem] italic leading-[1.75] text-light-text">{testimonial.quote}</p>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-orange-fire bg-gradient-to-br from-orange-fire to-orange-warm text-xl font-bold text-white">
            {testimonial.image ? <img src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" /> : initial}
          </div>
          <div>
            <div className="font-semibold text-white">{testimonial.name}</div>
            <div className="text-sm text-orange-warm">{testimonial.business} · {testimonial.city}</div>
            <div className="mt-1 text-sm text-orange-warm">★★★★★</div>
          </div>
        </div>
      </div>
      <div className="relative min-h-[260px] overflow-hidden bg-purple-deep">
        {testimonial.image ? (
          <img src={testimonial.image} alt={`${testimonial.name} testimonial`} className="h-full min-h-[260px] w-full object-cover object-top" />
        ) : (
          <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-gradient-to-br from-purple-mid to-purple-deep text-sm text-white/35">[ Client / Business Photo {index + 1} ]</div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(61,0,102,0.35)_0%,transparent_100%)]" />
      </div>
    </motion.div>
  );
}
function StatsBar() {
  return <div className="mt-10 grid overflow-hidden rounded-2xl bg-purple-deep md:grid-cols-4"><StatsBarItem number={20} suffix="+" label="Slots Available" /><StatsBarItem number={19} suffix="" label="Years Experience" /><StatsBarItem number={300} suffix="K" prefix="₦" label="Amount You Save" /><StatsBarItem number={7} suffix="" label="September Deadline" /></div>;
}

function StatsBarItem({ number, suffix, prefix = "", label }) {
  const { ref, count } = useCountUp(number);
  return <div ref={ref} className="border-b border-white/10 p-6 text-center md:border-b-0 md:border-r md:last:border-r-0"><div className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none text-orange-fire">{prefix}{count}{suffix}</div><div className="mt-2 text-sm uppercase tracking-[0.12em] text-light-text">{label}</div></div>;
}

function FAQSection() {
  const [open, setOpen] = useState(0);
  return <motion.section {...revealUp} id="faq-section" className="bg-purple-deep px-5 py-20 scroll-mt-28"><div className="mx-auto max-w-3xl"><h2 className="text-center text-[clamp(1.8rem,4vw,3rem)] font-bold text-white">Questions Before You Reserve?</h2><div className="mt-8 space-y-3">{faqs.map(([question, answer], index) => <div key={question} className={`rounded-xl bg-dark-text/70 ${open === index ? "border-l-4 border-purple-bright" : ""}`}><button onClick={() => setOpen(open === index ? -1 : index)} className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-white"><span>{question}</span><motion.span animate={{ rotate: open === index ? 45 : 0 }} className="text-2xl text-orange-fire">+</motion.span></button><AnimatePresence initial={false}>{open === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 leading-relaxed text-light-text">{answer}</p></motion.div>}</AnimatePresence></div>)}</div></div></motion.section>;
}

function FinalCTA({ slotsRemaining, timeLeft }) {
  return <motion.section {...revealUp} className="bg-[linear-gradient(135deg,#3D0066,#EA580C,#6B21A8)] bg-[length:200%_200%] px-5 py-20 text-center animate-shimmer"><div className="mx-auto max-w-3xl"><h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-tight text-white">Your Business Has Been<br />Waiting Long Enough.</h2><p className="mt-5 text-lg leading-relaxed text-light-text">The businesses that grow are not always the best ones. They are the ones that said yes when the window was open. The window closes {OFFER_END_SHORT}.</p><div className="mt-7 text-3xl font-bold text-orange-warm">🔴 {slotsRemaining} of 20 slots remaining</div><div className="mt-3 text-2xl font-bold"><CountdownText timeLeft={timeLeft} /></div><div className="mt-8"><CtaButton expired={timeLeft.expired} variant="white">→ Reserve My Slot. ₦50,000.</CtaButton><p className="mt-4 text-sm text-light-text">Fill the form below. Your slot is held for 30 minutes after submission. Payment locks it permanently.</p><ReminderButton dark /></div></div></motion.section>;
}

function FormField({ label, name, type = "text", placeholder, required, rows, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const inputClass = `w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-dark-text outline-none transition ${focused ? "border-purple-bright shadow-[0_0_0_4px_rgba(147,51,234,0.1)]" : "border-purple-bright/20"}`;
  return <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-dark-text">{label} {required && <span className="text-orange-fire">*</span>}</label>{type === "textarea" ? <textarea name={name} placeholder={placeholder} rows={rows} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} required={required} className={inputClass} /> : <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} required={required} className={inputClass} />}</div>;
}

function safeSessionSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Private browsing can block sessionStorage; navigation still works.
  }
}

function ReservationForm({ expired, onSlotReserved }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState({ firstName: "", lastName: "", businessName: "", businessDescription: "", city: "", whatsapp: "", email: "", hasWebsite: "" });
  const handleChange = (event) => setFormState((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    const required = ["firstName", "lastName", "email", "whatsapp", "businessName"];
    for (const field of required) {
      if (!formState[field]?.trim()) {
        setFormError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setFormError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(FLUENT_FORMS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify({
          first_name: formState.firstName.trim(),
          last_name: formState.lastName.trim(),
          email: formState.email.trim().toLowerCase(),
          whatsapp: formState.whatsapp.trim(),
          business_name: formState.businessName.trim(),
          business_description: formState.businessDescription?.trim() || "",
          city: formState.city?.trim() || "",
          has_website: formState.hasWebsite || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Submission failed. Please try again.");

      onSlotReserved?.();
      const applicant = { firstName: formState.firstName, lastName: formState.lastName, businessName: formState.businessName, whatsapp: formState.whatsapp, email: formState.email, submittedAt: new Date().toISOString() };
      safeSessionSet("abraham_applicant", JSON.stringify(applicant));
      navigate("/payment", { state: { applicant } });
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError(error.message || "The form could not connect. Please try again or contact Abraham directly on WhatsApp.");
      setIsSubmitting(false);
    }
  };

  if (expired) return <section id="reservation-form" className="bg-off-white px-5 py-20 scroll-mt-28"><ExpiredOffer /></section>;
  return <motion.section {...revealUp} id="reservation-form" className="bg-off-white px-5 py-20 scroll-mt-28"><div className="mx-auto max-w-3xl"><h2 className="text-center text-[clamp(1.8rem,4vw,3rem)] font-bold text-purple-mid">Reserve Your Slot Now</h2><p className="mt-3 text-center text-sm font-semibold text-orange-fire">⏱ Your slot is held for 30 minutes after this form is submitted. Payment happens on the next page.</p><div className="mt-8 rounded-[20px] border border-purple-bright/20 bg-white p-5 shadow-[0_20px_60px_rgba(61,0,102,0.1)] md:p-7"><form onSubmit={handleFormSubmit} className="flex flex-col gap-5"><div className="grid gap-4 md:grid-cols-2"><FormField label="First Name" name="firstName" required placeholder="Your first name" value={formState.firstName} onChange={handleChange} /><FormField label="Last Name" name="lastName" required placeholder="Your last name" value={formState.lastName} onChange={handleChange} /></div><FormField label="Business Name" name="businessName" required placeholder="What is your business called?" value={formState.businessName} onChange={handleChange} /><FormField label="What does your business do?" name="businessDescription" type="textarea" required placeholder="Briefly describe what you sell or offer..." rows={3} value={formState.businessDescription} onChange={handleChange} /><FormField label="City / State" name="city" required placeholder="e.g. Lagos, Abuja, Port Harcourt..." value={formState.city} onChange={handleChange} /><FormField label="WhatsApp Number" name="whatsapp" type="tel" required placeholder="e.g. 08012345678" value={formState.whatsapp} onChange={handleChange} /><FormField label="Email Address" name="email" type="email" required placeholder="your@email.com" value={formState.email} onChange={handleChange} /><div><label className="mb-2 block text-sm font-semibold text-dark-text">Do you currently have a website? *</label><div className="grid gap-2">{[["no", "No - I've never had one"], ["yes_replace", "Yes - but it needs replacing"], ["yes_curious", "Yes - I just want to learn more"]].map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-3 text-dark-text"><input required type="radio" name="hasWebsite" value={value} checked={formState.hasWebsite === value} onChange={handleChange} className="h-[18px] w-[18px] accent-orange-fire" />{label}</label>)}</div></div><motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-10 py-[18px] text-base font-semibold uppercase tracking-[0.04em] text-white shadow-[0_8px_30px_rgba(234,88,12,0.35)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-gray-300">{isSubmitting ? "⏳ Submitting..." : "→ Submit & Reserve My Slot"}</motion.button>{formError && <p className="text-center text-sm text-red-600">{formError}</p>}</form></div></div></motion.section>;
}

function ExpiredOffer() {
  return <div className="mx-auto max-w-2xl py-12 text-center"><h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-purple-mid">This Offer Has Closed.</h2><p className="mt-4 text-[1.0625rem] leading-[1.75] text-dark-text">All 20 slots have been filled or the offer window has ended. Abraham is now building websites at his standard rate of ₦350,000.</p><a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham, I want to ask about a standard website.`} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-7 py-4 text-base font-semibold uppercase tracking-[0.04em] text-white">→ Chat Abraham About a Standard Website</a></div>;
}

function PostFormReassurance() {
  const pillars = [["🏆", "19 Years of Experience", "Not a side hustle. The craft of a career."], ["🛡️", "Built Personally by Abraham", "No outsourcing. No templates. Your website, made by hand."], ["💬", "He Answers His Own Messages", "Questions? He replies himself. Not a bot. Not a team. Abraham."]];
  return <motion.section {...revealUp} className="bg-purple-deep px-5 py-16"><div className="mx-auto grid max-w-5xl gap-5 text-center md:grid-cols-3">{pillars.map(([icon, title, text]) => <div key={title} className="rounded-2xl bg-white/10 p-6 text-white"><div className="text-4xl">{icon}</div><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-2 text-light-text/80">{text}</p></div>)}</div></motion.section>;
}

function WhatsAppWidget() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [clicked, setClicked] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const timer = setTimeout(() => { if (!clicked) setShowTooltip(true); }, 15000);
    return () => clearTimeout(timer);
  }, [clicked]);
  return <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 2 }} className="fixed bottom-5 right-5 z-[999]"><AnimatePresence>{showTooltip && !clicked && <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} className="absolute bottom-[70px] right-0 whitespace-nowrap rounded-xl border border-purple-bright/20 bg-white px-4 py-2.5 text-sm font-medium text-dark-text shadow-[0_8px_30px_rgba(0,0,0,0.15)]">💬 Chat with Abraham<div className="absolute -bottom-1.5 right-6 h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white" /></motion.div>}</AnimatePresence><a onClick={() => setClicked(true)} href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham, I saw your ₦50,000 website offer and I have a question.`} target="_blank" rel="noreferrer" aria-label="Chat with Abraham on WhatsApp" className="group relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl"><span className="absolute inset-0 rounded-full bg-[#25D366] animate-ring-pulse" /><span className="pointer-events-none absolute right-14 hidden whitespace-nowrap rounded-full bg-dark-text px-4 py-2 text-sm font-semibold shadow-lg md:group-hover:block">Chat with Abraham</span><svg className="relative h-8 w-8" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.04 3.2A12.78 12.78 0 0 0 5.1 22.6L3.5 28.8l6.35-1.66A12.78 12.78 0 1 0 16.04 3.2Zm0 23.35a10.55 10.55 0 0 1-5.38-1.47l-.38-.23-3.76.98 1-3.66-.25-.38a10.56 10.56 0 1 1 8.77 4.76Zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.35-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" /></svg></a></motion.div>;
}

function Footer() {
  return (
    <footer className="bg-dark-text px-5 py-10 text-center text-sm text-light-text/75">
      <div className="mx-auto max-w-3xl border-t border-purple-bright/15 px-6 py-6">
        <p className="mb-2 text-sm text-light-text/60">Not looking for the ₦50,000 offer?</p>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham! I'm interested in a custom website or app - not the ₦50k offer. Can we talk?`} target="_blank" rel="noreferrer" className="inline-flex border-b border-orange-warm/40 pb-0.5 font-semibold text-orange-warm">
          Click here if you want a custom website or app instead →
        </a>
      </div>
      <div>© Abraham Akinwumi | Website Developer | 19 Years Experience</div>
      <div className="mt-2">Built websites that have grown businesses across Nigeria.</div>
      <div className="mt-2">WhatsApp: +2348182126524 · Email: abraham@abraham.com.ng</div>
      <div className="mx-auto mt-4 max-w-2xl text-xs text-light-text/45">Offer valid until {OFFER_END_COPY} only. This is a personal offer. 20 slots total. First paid, first served. After the timer ends, price returns to ₦350,000.</div>
    </footer>
  );
}

export default function LandingPage() {
  const [slotsRemaining, setSlotsRemaining] = useState(() => getSlotsRemaining());
  const timeLeft = useCountdown(OFFER_END_DATE);
  const shared = useMemo(() => ({ slotsRemaining, timeLeft }), [slotsRemaining, timeLeft]);
  const handleSlotReserved = () => {
    decrementRemoteSlot().then(setSlotsRemaining);
  };

  useEffect(() => {
    let active = true;
    fetchSlotsRemaining().then((slots) => {
      if (active) setSlotsRemaining(slots);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-off-white font-sans text-dark-text">
      <UrgencyBar {...shared} />
      <NavBar />
      <HeroSection {...shared} />
      <AbrahamLetter />
      <TransformationSection />
      <OfferBox {...shared} />
      <FOMOSection />
      <WhoIsThisFor />
      <CredibilitySection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA {...shared} />
      <ReservationForm expired={timeLeft.expired} onSlotReserved={handleSlotReserved} />
      <PostFormReassurance />
      <Footer />
      <WhatsAppWidget />
    </main>
  );
}


