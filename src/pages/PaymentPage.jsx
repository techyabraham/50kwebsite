import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MANUAL_BANK_DETAILS, PAYSTACK_PUBLIC_KEY, WHATSAPP_NUMBER } from "../constants";

const PAYMENT_WINDOW_MINUTES = 30;
const PAYMENT_AMOUNT_KOBO = 5000000;
const PAYMENT_AMOUNT_LABEL = "₦50,000";

function readApplicant() {
  if (typeof sessionStorage === "undefined") return {};

  try {
    return JSON.parse(sessionStorage.getItem("abraham_applicant") || "{}");
  } catch {
    return {};
  }
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function safeSessionSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Navigation still works if browser storage is unavailable.
  }
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const applicant = useMemo(() => location.state?.applicant || readApplicant(), [location.state]);
  const submittedAt = useMemo(() => new Date(applicant.submittedAt || new Date()), [applicant.submittedAt]);
  const expiresAt = useMemo(() => new Date(submittedAt.getTime() + PAYMENT_WINDOW_MINUTES * 60 * 1000), [submittedAt]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: PAYMENT_WINDOW_MINUTES, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [paystackMethod, setPaystackMethod] = useState("transfer");
  const [payStatus, setPayStatus] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = expiresAt - new Date();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const fullName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "a new client";
  const business = applicant.businessName || "my business";
  const isReserved = Boolean(applicant.submittedAt);
  const receiptMessage = `Hi Abraham! I have made the manual bank transfer of ${PAYMENT_AMOUNT_LABEL} for my website slot.\n\nName: ${fullName}\nBusiness: ${business}\nBank paid to: ${MANUAL_BANK_DETAILS.bank}\nAccount number: ${MANUAL_BANK_DETAILS.accountNumber}\n\nI am sending my receipt/proof of payment now.`;

  const handlePaystackPayment = async (method) => {
    if (expired) {
      setPayStatus("Your payment hold has expired. Return to the landing page and reserve again.");
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY) {
      setPayStatus("Paystack public key is missing. Add VITE_PAYSTACK_PUBLIC_KEY in .env.local and Vercel.");
      return;
    }

    const methodConfig = {
      transfer: {
        label: "Bank Transfer",
        channels: ["bank_transfer"],
        status: "Opening Paystack bank transfer checkout...",
      },
      opay: {
        label: "OPay",
        channels: ["bank_transfer"],
        status: "Opening Paystack transfer checkout. Use your OPay app to pay into the generated account.",
      },
      card: {
        label: "Card",
        channels: ["card"],
        status: "Opening secure Paystack card checkout...",
      },
    }[method];

    setPayStatus(methodConfig.status);

    try {
      const module = await import("@paystack/inline-js");
      const PaystackPop = module.default || module.PaystackPop;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: applicant.email || "customer@example.com",
        amount: PAYMENT_AMOUNT_KOBO,
        currency: "NGN",
        reference: `ABRAHAM_${method.toUpperCase()}_${Date.now()}`,
        channels: methodConfig.channels,
        label: `Abraham Website Slot - ${methodConfig.label}`,
        firstName: applicant.firstName || "",
        lastName: applicant.lastName || "",
        phone: applicant.whatsapp || "",
        metadata: {
          name: fullName,
          business,
          phone: applicant.whatsapp || "",
          preferred_payment_method: `Paystack ${methodConfig.label}`,
        },
        onLoad: () => setPayStatus(`${methodConfig.label} checkout loaded. Complete payment in the Paystack popup.`),
        onSuccess: (transaction) => {
          const payment = {
            method: `Paystack ${methodConfig.label}`,
            reference: transaction.reference,
            paidAt: new Date().toISOString(),
          };
          setPayStatus("Payment received. Redirecting to onboarding...");
          safeSessionSet("abraham_applicant", JSON.stringify(applicant));
          safeSessionSet("abraham_payment", JSON.stringify(payment));
          navigate("/onboarding", {
            state: {
              applicant,
              payment,
            },
          });
        },
        onError: (error) => setPayStatus(error?.message || "Paystack could not start this payment method. Please try again."),
        onCancel: () => setPayStatus("Checkout closed. You can retry when you're ready."),
      });
    } catch (error) {
      setPayStatus(error?.message || "Paystack could not load. Check the public key and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-off-white font-sans text-dark-text">
      <div className={`sticky top-0 z-[100] ${expired ? "bg-gradient-to-r from-red-700 to-red-500" : "bg-gradient-to-r from-purple-deep to-purple-mid"}`}>
        <div className="mx-auto max-w-3xl px-4 py-4 text-center sm:px-6">
          {expired ? (
            <p className="font-semibold text-white">
              Your 30-minute hold has expired. Your slot may have been released.{" "}
              <button onClick={() => navigate("/")} className="font-bold text-orange-warm underline">Return to page -&gt;</button>
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs uppercase tracking-[0.08em] text-white/80">Your slot is secured for</p>
              <PaymentCountdownBoxes timeLeft={timeLeft} />
              <p className="mt-2 text-sm italic text-white/70">Complete payment to permanently secure your slot.</p>
            </>
          )}
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 shadow-[0_20px_70px_rgba(61,0,102,0.14)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-fire">Slot reserved</p>
          <h1 className="mt-3 text-[clamp(2rem,6vw,3.5rem)] font-bold leading-tight text-purple-mid">Choose How You Want To Pay.</h1>
          <p className="mt-4 max-w-3xl leading-[1.75] text-dark-text/75">
            {isReserved ? (
              <>Hi {fullName}. Your form has been received for <strong>{business}</strong>. You can pay manually and send Abraham your receipt, or pay automatically through Paystack and continue straight to the onboarding form.</>
            ) : (
              <>You can still use this page directly. Manual payment sends your receipt to Abraham. Paystack payment redirects you to the onboarding form after successful payment.</>
            )}
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <ManualTransferCard receiptMessage={receiptMessage} />
            <PaystackCard method={paystackMethod} onMethodChange={setPaystackMethod} onPay={handlePaystackPayment} payStatus={payStatus} expired={expired} />
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-purple-bright/15 bg-off-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-purple-mid">Already paid or need help?</h2>
              <p className="mt-1 text-sm text-dark-text/70">Message Abraham with your name, business, and payment status.</p>
            </div>
            <a href={buildWhatsAppUrl(`Hi Abraham! I need help confirming payment for my website slot. My name is ${fullName}, business: ${business}.`)} target="_blank" rel="noreferrer" className="inline-flex justify-center rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white">
              Chat Abraham
            </a>
          </div>
        </motion.div>

        <div className="mt-10 text-center">
          <button onClick={() => navigate("/")} className="text-sm text-purple-bright underline">&lt;- Return to the main page</button>
        </div>
      </section>
    </main>
  );
}

function ManualTransferCard({ receiptMessage }) {
  return (
    <section className="rounded-2xl border border-purple-bright/15 bg-off-white p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-fire">Option 1</div>
      <h2 className="mt-2 text-2xl font-bold text-purple-mid">Manual Bank Transfer</h2>
      <p className="mt-2 leading-relaxed text-dark-text/75">Transfer directly to Abraham's UBA account. After payment, send the receipt on WhatsApp and Abraham will send you the full website brief form manually.</p>

      <div className="mt-5 rounded-2xl bg-gradient-to-br from-purple-deep to-purple-mid p-5">
        {[
          ["Bank", MANUAL_BANK_DETAILS.bank],
          ["Account Number", MANUAL_BANK_DETAILS.accountNumber],
          ["Account Name", MANUAL_BANK_DETAILS.accountName],
          ["Amount", PAYMENT_AMOUNT_LABEL],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
            <span className="text-sm text-light-text/70">{label}</span>
            <span className="text-right font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>

      <a href={buildWhatsAppUrl(receiptMessage)} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full justify-center rounded-full bg-[#25D366] px-6 py-4 font-semibold text-white">
        Send Receipt on WhatsApp
      </a>
    </section>
  );
}

function PaystackCard({ method, onMethodChange, onPay, payStatus, expired }) {
  const options = [
    ["transfer", "Bank Transfer"],
    ["opay", "OPay"],
    ["card", "Card"],
  ];

  const copy = {
    transfer: ["Paystack Bank Transfer", "Paystack generates a secure account for this payment and confirms the transaction automatically."],
    opay: ["Paystack + OPay", "Open Paystack transfer checkout, then pay from your OPay app into the generated account."],
    card: ["Paystack Card", "Pay securely with a card through Paystack. Successful payment sends you straight to onboarding."],
  }[method];

  return (
    <section className="rounded-2xl border border-orange-fire/20 bg-white p-5 shadow-[0_14px_40px_rgba(234,88,12,0.12)]">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-fire">Option 2</div>
      <h2 className="mt-2 text-2xl font-bold text-purple-mid">Automatic Paystack Payment</h2>
      <p className="mt-2 leading-relaxed text-dark-text/75">Use Paystack if you want the automated route. Once payment succeeds, you will be redirected to the onboarding form immediately.</p>

      <div className="mt-5 grid gap-2 rounded-2xl bg-off-white p-1 sm:grid-cols-3">
        {options.map(([id, label]) => (
          <button key={id} onClick={() => onMethodChange(id)} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${method === id ? "bg-purple-mid text-white shadow-lg" : "text-purple-mid hover:bg-white"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-purple-bright/15 bg-off-white p-5 text-center">
        <h3 className="text-xl font-bold text-purple-mid">{copy[0]}</h3>
        <p className="mx-auto mt-2 max-w-xl leading-relaxed text-dark-text/75">{copy[1]}</p>
        <button onClick={() => onPay(method)} disabled={expired} className="mt-5 rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-8 py-4 font-semibold text-white shadow-[0_8px_24px_rgba(234,88,12,0.3)] disabled:cursor-not-allowed disabled:opacity-50">
          Pay {PAYMENT_AMOUNT_LABEL} with Paystack
        </button>
      </div>

      <p className="mt-4 min-h-6 text-center text-sm font-semibold text-purple-bright">{payStatus || "Secured by Paystack"}</p>
    </section>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className="min-w-[70px] rounded-xl bg-black/30 px-4 py-2 text-center">
      <div className="text-3xl font-bold leading-none tabular-nums text-orange-warm">{value}</div>
      <div className="mt-1 text-[0.65rem] uppercase tracking-[0.08em] text-white/60">{label}</div>
    </div>
  );
}

function PaymentCountdownBoxes({ timeLeft }) {
  const boxes = timeLeft.days > 0
    ? [["DAY", pad(timeLeft.days)], ["HRS", pad(timeLeft.hours)], ["MIN", pad(timeLeft.minutes)], ["SEC", pad(timeLeft.seconds)]]
    : [["HRS", pad(timeLeft.hours)], ["MIN", pad(timeLeft.minutes)], ["SEC", pad(timeLeft.seconds)]];

  return (
    <div className={`mx-auto grid gap-2 sm:flex sm:max-w-none sm:items-center sm:justify-center ${timeLeft.days > 0 ? "max-w-[21rem] grid-cols-2" : "max-w-[18rem] grid-cols-3"}`}>
      {boxes.map(([label, value], index) => (
        <React.Fragment key={label}>
          {index > 0 && <span className="hidden text-3xl font-bold text-orange-fire sm:inline">:</span>}
          <TimeBox value={value} label={label} />
        </React.Fragment>
      ))}
    </div>
  );
}
