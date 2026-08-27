import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { WHATSAPP_NUMBER } from "../constants";

const PAYMENT_WINDOW_MINUTES = 30;

function readApplicant() {
  try {
    return JSON.parse(sessionStorage.getItem("abraham_applicant") || "{}");
  } catch {
    return {};
  }
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const applicant = useMemo(() => location.state?.applicant || readApplicant(), [location.state]);
  const submittedAt = useMemo(() => new Date(applicant.submittedAt || new Date()), [applicant.submittedAt]);
  const expiresAt = useMemo(() => new Date(submittedAt.getTime() + PAYMENT_WINDOW_MINUTES * 60 * 1000), [submittedAt]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: PAYMENT_WINDOW_MINUTES, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
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

  const handlePaystackPayment = async () => {
    setPayStatus("Opening secure Paystack checkout...");
    try {
      const module = await import("@paystack/inline-js");
      const PaystackPop = module.default || module.PaystackPop;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: "[YOUR_PAYSTACK_PUBLIC_KEY]",
        email: applicant.email || "customer@example.com",
        amount: 5000000,
        currency: "NGN",
        ref: `ABRAHAM_${Date.now()}`,
        metadata: {
          name: `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim(),
          business: applicant.businessName || "",
          phone: applicant.whatsapp || "",
        },
        onSuccess: (transaction) => {
          setPayStatus("Payment received. Opening WhatsApp confirmation...");
          window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=I just paid for my website slot! Transaction ref: ${transaction.reference}`,
            "_blank",
          );
        },
        onCancel: () => setPayStatus("Checkout closed. You can retry when you're ready."),
      });
    } catch {
      setPayStatus("Paystack could not load. Please use Transfer or Opay, or check the public key.");
    }
  };

  const isReserved = Boolean(applicant.submittedAt);
  const fullName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "a new client";
  const business = applicant.businessName || "my business";

  return (
    <main className="min-h-screen bg-off-white font-sans text-dark-text">
      <div className={`sticky top-0 z-[100] ${expired ? "bg-gradient-to-r from-red-700 to-red-500" : "bg-gradient-to-r from-purple-deep to-purple-mid"}`}>
        <div className="mx-auto max-w-3xl px-6 py-4 text-center">
          {expired ? (
            <p className="font-semibold text-white">
              Your 30-minute hold has expired. Your slot may have been released.{" "}
              <button onClick={() => navigate("/")} className="font-bold text-orange-warm underline">Return to page -&gt;</button>
            </p>
          ) : (
            <>
              <p className="mb-1 text-xs uppercase tracking-[0.08em] text-white/80">Your slot is secured for</p>
              <div className="flex items-center justify-center gap-2">
                <TimeBox value={pad(timeLeft.days)} label="DAY" />
                <span className="text-3xl font-bold text-orange-fire">:</span>
                <TimeBox value={pad(timeLeft.hours)} label="HRS" />
                <span className="text-3xl font-bold text-orange-fire">:</span>
                <TimeBox value={pad(timeLeft.minutes)} label="MIN" />
                <span className="text-3xl font-bold text-orange-fire">:</span>
                <TimeBox value={pad(timeLeft.seconds)} label="SEC" />
              </div>
              <p className="mt-1 text-sm italic text-white/70">Complete payment to permanently secure your slot.</p>
            </>
          )}
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 shadow-[0_20px_70px_rgba(61,0,102,0.14)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-fire">Slot reserved</p>
          <h1 className="mt-3 text-[clamp(2rem,6vw,3.5rem)] font-bold leading-tight text-purple-mid">Before You Pay, Chat Abraham First.</h1>
          <p className="mt-4 leading-[1.75] text-dark-text/75">
            {isReserved ? (
              <>Hi {fullName}. Your form has been received for <strong>{business}</strong>. Please send Abraham a quick WhatsApp message first so he can confirm the best payment method and your slot details.</>
            ) : (
              <>You are on the payment page. If you already submitted the form, please chat Abraham with your details before paying. If not, return to the form first so your slot can be reserved.</>
            )}
          </p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham! I just submitted the form for my website slot. My name is ${fullName}, business: ${business}. Please confirm before I pay.`} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full justify-center rounded-full bg-[#25D366] px-6 py-4 font-semibold text-white md:w-auto">
            Chat Abraham Before Paying -&gt;
          </a>

          <div className="mt-8 flex gap-2 overflow-x-auto rounded-full bg-off-white p-1">
            {[
              ["chat", "Chat First"],
              ["card", "Card"],
              ["transfer", "Transfer"],
              ["opay", "Opay"],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`min-w-max flex-1 rounded-full px-4 py-3 text-sm font-bold ${activeTab === id ? "bg-purple-mid text-white" : "text-purple-mid"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "chat" && (
              <div className="rounded-2xl border border-purple-bright/15 bg-off-white p-5">
                <h2 className="text-xl font-bold text-purple-mid">Why chat first?</h2>
                <p className="mt-2 leading-relaxed">Abraham answers personally. A quick message confirms your form, your name, and the payment method before money leaves your account.</p>
              </div>
            )}

            {activeTab === "card" && (
              <div className="rounded-2xl border border-purple-bright/15 bg-white p-5 text-center">
                <button onClick={handlePaystackPayment} disabled={expired} className="rounded-full bg-gradient-to-r from-orange-fire to-orange-warm px-10 py-4 font-semibold text-white shadow-[0_8px_24px_rgba(234,88,12,0.3)] disabled:cursor-not-allowed disabled:opacity-50">
                  Pay ₦50,000 with Card -&gt;
                </button>
                <p className="mt-3 text-sm text-purple-bright">{payStatus || "Secured by Paystack"}</p>
              </div>
            )}

            {activeTab === "transfer" && (
              <div className="rounded-2xl border border-purple-bright/15 bg-white p-5">
                <p className="mb-5 leading-relaxed text-purple-mid">Transfer ₦50,000 to the account below, then send proof to Abraham on WhatsApp to confirm your slot immediately.</p>
                <div className="mb-5 rounded-xl bg-gradient-to-br from-purple-deep to-purple-mid p-5">
                  {[
                    ["Bank", "[BANK NAME]"],
                    ["Account Number", "[ACCOUNT NUMBER]"],
                    ["Account Name", "Abraham Akinwumi"],
                    ["Amount", "₦50,000"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-white/10 py-2 last:border-b-0">
                      <span className="text-sm text-light-text/70">{label}</span>
                      <span className="text-right font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham! I've made a bank transfer of ₦50,000 for my website slot. My name is ${fullName}, business: ${business}. Here is my proof:`} target="_blank" rel="noreferrer" className="flex justify-center rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white">
                  Send Proof on WhatsApp
                </a>
              </div>
            )}

            {activeTab === "opay" && (
              <div className="rounded-2xl border border-purple-bright/15 bg-white p-5 text-center">
                <p className="mb-5 leading-relaxed text-purple-mid">Scan the QR code below with your Opay app to pay ₦50,000, then send proof to Abraham on WhatsApp.</p>
                <div className="mx-auto mb-5 flex h-52 w-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-bright bg-gradient-to-br from-light-text to-orange-glow">
                  <span className="text-sm font-semibold text-purple-mid">[ Opay QR Code ]<br />Replace with actual QR</span>
                </div>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi Abraham! I've paid via Opay for my website slot. My name is ${fullName}, business: ${business}. Here is my proof:`} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white">
                  Send Proof on WhatsApp
                </a>
              </div>
            )}
          </div>
        </motion.div>

        <div className="mt-10 text-center">
          <button onClick={() => navigate("/")} className="text-sm text-purple-bright underline">&lt;- Return to the main page</button>
        </div>
      </section>
    </main>
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
