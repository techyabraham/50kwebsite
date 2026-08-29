import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { INTAKE_FORM_URL, WHATSAPP_NUMBER } from "../constants";

const TOTAL_STEPS = 13;

const initialForm = {
  name: "",
  businessName: "",
  whatsapp: "",
  email: "",
  whatYouDo: "",
  audience: "",
  goal: "",
  services: "",
  pages: [],
  tone: "",
  colors: [],
  colorNotes: "",
  inspiration: "",
  files: [],
  instagram: "",
  facebook: "",
  tiktok: "",
  twitter: "",
  extras: "",
};

const goals = [
  "Call or WhatsApp me directly",
  "Fill a form to request a service",
  "Buy something from my online catalogue",
  "Book an appointment",
  "Just learn about what I do",
];

const pageOptions = [
  "Home page",
  "About us / Our story",
  "Services or products page",
  "Portfolio / Gallery",
  "Testimonials / Reviews",
  "Contact page",
  "Blog / News",
  "FAQ page",
];

const tones = [
  "Professional and corporate",
  "Warm and friendly",
  "Bold and energetic",
  "Elegant and premium",
  "Simple and clean",
  "Fun and youthful",
];

const colors = [
  ["#1a1a1a", "Black"],
  ["#ffffff", "White"],
  ["#9333EA", "Purple"],
  ["#EA580C", "Orange"],
  ["#2563EB", "Blue"],
  ["#16A34A", "Green"],
  ["#DC2626", "Red"],
  ["#D97706", "Gold"],
  ["#EC4899", "Pink"],
  ["#0891B2", "Teal"],
  ["#7C3AED", "Violet"],
  ["#65A30D", "Lime"],
];

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function OnboardingPage() {
  const location = useLocation();
  const payment = location.state?.payment;
  const applicant = location.state?.applicant || {};
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    name: `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim(),
    businessName: applicant.businessName || "",
    whatsapp: applicant.whatsapp || "",
    email: applicant.email || "",
  }));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  const progress = Math.round((Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100);
  const summaryRows = useMemo(
    () => [
      ["Your name", form.name],
      ["Business name", form.businessName],
      ["WhatsApp", form.whatsapp],
      ["Email", form.email],
      ["What you do", form.whatYouDo],
      ["Ideal customer", form.audience],
      ["Main goal", form.goal],
      ["Services / Products", form.services],
      ["Pages needed", form.pages.join(", ")],
      ["Website tone", form.tone],
      ["Brand colours", [...form.colors, form.colorNotes].filter(Boolean).join(", ") || "No preference"],
      ["Design inspiration", form.inspiration || "None provided"],
      ["Uploaded files", form.files.map((file) => file.name).join(", ") || "None listed"],
      ["Instagram", form.instagram || "-"],
      ["Facebook", form.facebook || "-"],
      ["TikTok", form.tiktok || "-"],
      ["Twitter / X", form.twitter || "-"],
      ["Extra notes", form.extras || "Nothing extra."],
      ["Payment method", payment?.method || "Not supplied"],
      ["Payment reference", payment?.reference || "Not supplied"],
    ],
    [form, payment],
  );

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const toggleArrayValue = (name, value) => {
    setForm((current) => {
      const set = new Set(current[name]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...current, [name]: [...set] };
    });
  };

  const validateStep = () => {
    setError("");
    if (step === 1 && (!form.name.trim() || !form.businessName.trim())) return "Your name and business name are required.";
    if (step === 2 && !form.whatsapp.trim()) return "WhatsApp number is required.";
    if (step === 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (step === 3 && form.whatYouDo.trim().length < 20) return "Tell Abraham a bit more about what your business does.";
    if (step === 4 && form.audience.trim().length < 10) return "Describe your ideal customer, even if it is a rough description.";
    if (step === 5 && !form.goal) return "Pick the main action visitors should take.";
    if (step === 6 && form.services.trim().length < 5) return "List at least one service or product.";
    if (step === 7 && !form.pages.length) return "Pick at least one page.";
    if (step === 8 && !form.tone) return "Choose the tone that fits your brand.";
    return "";
  };

  const goNext = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setStep((value) => Math.min(value + 1, TOTAL_STEPS + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setError("");
    setStep((value) => Math.max(value - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    setStatus("submitting");
    setError("");

    const payload = {
      ...form,
      pages: form.pages.join(", "),
      colors: [...form.colors, form.colorNotes].filter(Boolean).join(", ") || "No preference",
      files: form.files.map((file) => file.name).join(", ") || "None listed",
      payment_method: payment?.method || "",
      payment_reference: payment?.reference || "",
      paid_at: payment?.paidAt || "",
      source: "react-onboarding-page",
    };

    try {
      const response = await fetch(INTAKE_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Submission failed.");
      setStatus("done");
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError.message || "The form could not submit. Send Abraham a WhatsApp heads-up instead.");
    }
  };

  if (status === "done") {
    return (
      <main className="min-h-screen bg-off-white px-5 py-12 font-sans text-dark-text">
        <section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-[0_20px_70px_rgba(61,0,102,0.14)] md:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-bright/10 text-3xl text-purple-bright">✓</div>
          <h1 className="mt-5 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-purple-mid">Received. Abraham has your website brief.</h1>
          <p className="mt-4 leading-relaxed text-dark-text/75">Your answers have been submitted. Abraham will review everything and follow up on WhatsApp.</p>
          <a href={buildWhatsAppUrl("Hi Abraham! I just submitted my website brief. Looking forward to hearing from you.")} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white">
            Send Abraham a heads-up
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-off-white px-5 py-8 font-sans text-dark-text">
      <section className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-semibold text-purple-bright">&lt;- Back to offer page</Link>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-3xl bg-white p-5 shadow-[0_20px_70px_rgba(61,0,102,0.14)] md:p-8">
          <div className="mb-8 h-2 overflow-hidden rounded-full bg-purple-bright/10">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-bright to-orange-fire transition-all" style={{ width: `${progress}%` }} />
          </div>

          {payment?.reference && (
            <div className="mb-6 rounded-2xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-green-800">
              Payment confirmed through {payment.method}. Reference: <strong>{payment.reference}</strong>
            </div>
          )}

          {step <= TOTAL_STEPS ? (
            <StepContent form={form} step={step} update={update} toggleArrayValue={toggleArrayValue} />
          ) : (
            <ReviewStep rows={summaryRows} />
          )}

          {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

          <div className="mt-8 flex items-center gap-3">
            {step > 1 && (
              <button onClick={goBack} className="rounded-full border border-purple-bright/30 px-5 py-3 font-semibold text-purple-mid">
                Back
              </button>
            )}
            {step <= TOTAL_STEPS ? (
              <button onClick={goNext} className="rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-7 py-3 font-semibold text-white">
                {step === TOTAL_STEPS ? "Review answers" : "Continue"}
              </button>
            ) : (
              <button onClick={submit} disabled={status === "submitting"} className="rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-7 py-3 font-semibold text-white disabled:opacity-60">
                {status === "submitting" ? "Submitting..." : "Submit website brief"}
              </button>
            )}
            <span className="ml-auto text-sm text-dark-text/50">{step <= TOTAL_STEPS ? `Step ${step} of ${TOTAL_STEPS}` : "Review"}</span>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function StepContent({ form, step, update, toggleArrayValue }) {
  const common = "w-full rounded-xl border-2 border-purple-bright/20 bg-white px-4 py-3 text-base text-dark-text outline-none transition focus:border-purple-bright focus:shadow-[0_0_0_4px_rgba(147,51,234,0.1)]";

  if (step === 1) return <Step label="Getting started" question="What's your name, and what do you call your business?" sub="This goes straight on your website, so use the official name."><input className={`${common} mb-3`} value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" /><input className={common} value={form.businessName} onChange={(event) => update("businessName", event.target.value)} placeholder="Business name" /></Step>;
  if (step === 2) return <Step label="Contact" question="Where can Abraham reach you when your site is ready?" sub="WhatsApp and email are both needed so nothing gets missed."><input className={`${common} mb-3`} value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} placeholder="WhatsApp number" /><input className={common} value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Email address" type="email" /></Step>;
  if (step === 3) return <Step label="Your business" question="What does your business actually do?" sub="Imagine you're telling a friend in one paragraph. Abraham will tidy the copy."><textarea className={common} rows={5} value={form.whatYouDo} onChange={(event) => update("whatYouDo", event.target.value)} placeholder="We help Lagos small businesses..." /></Step>;
  if (step === 4) return <Step label="Your customers" question="Who is your ideal customer?" sub="Age range, location, what they care about, and the problem they want solved."><textarea className={common} rows={4} value={form.audience} onChange={(event) => update("audience", event.target.value)} placeholder="Working moms in Lagos between 28 and 45..." /></Step>;
  if (step === 5) return <ChoiceStep label="Your goal" question="What's the main thing you want visitors to do on your website?" options={goals} selected={form.goal} onPick={(value) => update("goal", value)} />;
  if (step === 6) return <Step label="Your offer" question="What services or products do you want on your website?" sub="List everything. If you have prices, include them."><textarea className={common} rows={5} value={form.services} onChange={(event) => update("services", event.target.value)} placeholder={"1. At-home haircut - ₦5,000\n2. Full grooming package - ₦8,000"} /></Step>;
  if (step === 7) return <ChoiceStep label="Pages" question="Which pages do you need on your website?" options={pageOptions} selected={form.pages} multi onPick={(value) => toggleArrayValue("pages", value)} />;
  if (step === 8) return <ChoiceStep label="Look and feel" question="What should your website feel like?" options={tones} selected={form.tone} grid onPick={(value) => update("tone", value)} />;
  if (step === 9) return <Step label="Colours" question="Do you have brand colours?" sub="Pick colours below, or type your exact codes/names."><div className="flex flex-wrap gap-3">{colors.map(([value, label]) => <button key={value} title={label} onClick={() => toggleArrayValue("colors", value)} className={`h-10 w-10 rounded-full border-4 transition ${form.colors.includes(value) ? "scale-110 border-purple-bright" : "border-transparent"}`} style={{ background: value }} />)}</div><input className={`${common} mt-4`} value={form.colorNotes} onChange={(event) => update("colorNotes", event.target.value)} placeholder="Or type colour names/codes" /></Step>;
  if (step === 10) return <Step label="Inspiration" question="Is there a website you love the look of?" sub="Paste a link. The style matters, even if the industry is different."><input className={common} value={form.inspiration} onChange={(event) => update("inspiration", event.target.value)} placeholder="https://www.example.com or none" /></Step>;
  if (step === 11) return <Step label="Assets" question="Upload your logo and photos." sub="The app records file names for the brief. Send actual files to Abraham on WhatsApp if needed."><label className="block cursor-pointer rounded-2xl border-2 border-dashed border-purple-bright/30 bg-off-white p-8 text-center text-dark-text/70 hover:border-purple-bright"><input className="hidden" type="file" multiple accept="image/*,.pdf,.svg,.ai,.eps" onChange={(event) => update("files", Array.from(event.target.files || []))} /><strong className="text-purple-mid">Click to choose files</strong><br />Logo, product photos, team images, PDFs</label><div className="mt-3 grid gap-2">{form.files.map((file) => <div key={file.name} className="rounded-lg border border-purple-bright/15 bg-white px-3 py-2 text-sm">{file.name}</div>)}</div></Step>;
  if (step === 12) return <Step label="Social media" question="Which social media accounts should link to your website?" sub="Paste links or handles."><input className={`${common} mb-3`} value={form.instagram} onChange={(event) => update("instagram", event.target.value)} placeholder="Instagram" /><input className={`${common} mb-3`} value={form.facebook} onChange={(event) => update("facebook", event.target.value)} placeholder="Facebook" /><input className={`${common} mb-3`} value={form.tiktok} onChange={(event) => update("tiktok", event.target.value)} placeholder="TikTok" /><input className={common} value={form.twitter} onChange={(event) => update("twitter", event.target.value)} placeholder="Twitter / X" /></Step>;
  return <Step label="Final touch" question="Is there anything else Abraham should know?" sub="Anything special, a competitor to look at, or something you do not want missed."><textarea className={common} rows={4} value={form.extras} onChange={(event) => update("extras", event.target.value)} placeholder="Extra notes..." /></Step>;
}

function Step({ label, question, sub, children }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-fire">{label}</div>
      <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight text-purple-mid">{question}</h1>
      {sub && <p className="mt-2 mb-6 leading-relaxed text-dark-text/70">{sub}</p>}
      {children}
    </div>
  );
}

function ChoiceStep({ label, question, options, selected, onPick, multi = false, grid = false }) {
  return (
    <Step label={label} question={question}>
      <div className={`grid gap-3 ${grid ? "sm:grid-cols-2" : ""}`}>
        {options.map((option) => {
          const active = multi ? selected.includes(option) : selected === option;
          return (
            <button key={option} onClick={() => onPick(option)} className={`rounded-xl border-2 px-4 py-3 text-left font-semibold transition ${active ? "border-purple-bright bg-purple-bright/10 text-purple-mid" : "border-purple-bright/15 bg-white text-dark-text hover:border-purple-bright"}`}>
              {option}
            </button>
          );
        })}
      </div>
    </Step>
  );
}

function ReviewStep({ rows }) {
  return (
    <Step label="Review" question="Here's everything you've shared." sub="Take a quick look and submit when you're happy.">
      <div className="rounded-2xl border border-purple-bright/15 bg-off-white p-4">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 border-b border-purple-bright/10 py-3 last:border-b-0 sm:grid-cols-[160px_1fr]">
            <span className="text-sm font-semibold text-dark-text/60">{label}</span>
            <span className="break-words text-sm text-dark-text">{value || "-"}</span>
          </div>
        ))}
      </div>
    </Step>
  );
}
