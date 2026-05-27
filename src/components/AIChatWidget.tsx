"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Phone, Bot, User, Zap, Heart } from "lucide-react";
import { matchFAQ, detectUrgency } from "@/lib/faqData";
import SpeakToUsButton from "./SpeakToUsButton";

const OFFICE = "817-265-5762";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  isUrgent?: boolean;
  followUps?: string[];
  buttons?: { label: string; value: string }[];
  isCapture?: boolean;
}

type FlowStage = "chat" | "capture_prompt" | "capture_name" | "capture_contact" | "done";

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  text: "Need a caregiver for someone you love? 💛\n\nI can help with same-day placement, vetting questions, and finding the right fit. What's most urgent for you right now?",
};

const FALLBACK = "That's a great question — our care coordinators can give you a precise answer. Call us at 817-265-5762 or request care below and we'll reach out within the hour.";

const INITIAL_PROMPTS = [
  "I need a caregiver today",
  "How fast can you place someone?",
  "Are your caregivers background-checked?",
  "What areas do you cover?",
];

const FOLLOW_UPS: Record<string, string[]> = {
  availability: ["Are your caregivers vetted?", "What areas do you cover?", "What does care cost?"],
  safety:       ["What types of caregivers do you staff?", "How fast can you place someone?", "I need care today"],
  services:     ["Memory care staff?", "What does care cost?", "Are you available 24/7?"],
  pricing:      ["What services do you provide?", "I need care today", "How fast can you place someone?"],
  process:      ["Are your caregivers vetted?", "What does care cost?", "I need care today"],
  fallback:     ["I need care today", "Are your caregivers vetted?", "What services do you provide?"],
};

function pickFollowUps(query: string, matchId?: string): string[] {
  const q = query.toLowerCase();
  if (matchId?.includes("same-day") || matchId?.includes("hours"))      return FOLLOW_UPS.availability;
  if (matchId?.includes("background") || matchId?.includes("insurance")) return FOLLOW_UPS.safety;
  if (matchId?.includes("prn") || matchId?.includes("memory"))           return FOLLOW_UPS.services;
  if (matchId?.includes("cost") || matchId?.includes("contract"))        return FOLLOW_UPS.pricing;
  if (matchId?.includes("how-it-works") || matchId?.includes("areas"))   return FOLLOW_UPS.process;
  if (q.includes("today") || q.includes("now") || q.includes("urgent"))  return FOLLOW_UPS.availability;
  if (q.includes("vet") || q.includes("check") || q.includes("safe"))    return FOLLOW_UPS.safety;
  if (q.includes("service") || q.includes("type") || q.includes("memory")) return FOLLOW_UPS.services;
  if (q.includes("cost") || q.includes("price") || q.includes("pay"))    return FOLLOW_UPS.pricing;
  return FOLLOW_UPS.fallback;
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export default function AIChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input,    setInput]    = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stage,    setStage]    = useState<FlowStage>("chat");
  const [leadName, setLeadName] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("open-ai-chat", h);
    return () => window.removeEventListener("open-ai-chat", h);
  }, []);

  const sendLeadCapture = useCallback(async () => {
    setStage("capture_prompt");
    setIsTyping(true);
    await delay(900);
    setIsTyping(false);
    setMessages((p) => [...p, {
      id: `cap-${Date.now()}`, role: "assistant",
      text: "Our care coordinators can put together the right match.\n\nCan I get your name and best contact so they can reach you within the hour?",
      buttons: [
        { label: "Yes — connect me with a coordinator", value: "yes_capture" },
        { label: "Maybe later", value: "no_capture" },
      ],
    }]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    if (stage === "capture_name") {
      const name = text.trim();
      setLeadName(name);
      setMessages((p) => [...p, { id: Date.now().toString(), role: "user", text }]);
      setInput("");
      setIsTyping(true);
      await delay(700);
      setIsTyping(false);
      setStage("capture_contact");
      setMessages((p) => [...p, {
        id: `ask-c-${Date.now()}`, role: "assistant",
        text: `Perfect, ${name} 👋\n\nWhat's the best phone number or email to reach you?`,
      }]);
      return;
    }

    if (stage === "capture_contact") {
      const contact = text.trim();
      setMessages((p) => [...p, { id: Date.now().toString(), role: "user", text }]);
      setInput("");
      setIsTyping(true);
      await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName, subject: "Chat Lead — Care Request",
          message: `Chat lead\nName: ${leadName}\nContact: ${contact}`,
          phone: contact.match(/\d{7,}/) ? contact : undefined,
          email: contact.includes("@") ? contact : undefined,
        }),
      }).catch(console.error);
      await delay(1000);
      setIsTyping(false);
      setStage("done");
      setMessages((p) => [...p, {
        id: `done-${Date.now()}`, role: "assistant", isCapture: true,
        text: `Got it! A coordinator will reach out shortly, ${leadName}.\n\nFor immediate help, call us directly:`,
      }]);
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    const newCount = msgCount + 1;
    setMsgCount(newCount);
    await delay(700 + Math.random() * 500);
    const isUrgent  = detectUrgency(text);
    const match     = matchFAQ(text);
    const replyText = match?.answer ?? FALLBACK;
    const followUps = pickFollowUps(text, match?.id);
    setIsTyping(false);
    setMessages((p) => [...p, {
      id: (Date.now() + 1).toString(), role: "assistant",
      text: replyText, isUrgent: isUrgent || match?.urgency, followUps,
    }]);
    if (newCount >= 2 && !isUrgent && stage === "chat") {
      await delay(1800);
      await sendLeadCapture();
    }
  }, [isTyping, stage, leadName, msgCount, sendLeadCapture]);

  const handleButtonAction = useCallback(async (value: string) => {
    if (value === "yes_capture") {
      setMessages((p) => [...p, { id: Date.now().toString(), role: "user", text: "Yes — connect me" }]);
      setIsTyping(true);
      await delay(700);
      setIsTyping(false);
      setStage("capture_name");
      setMessages((p) => [...p, { id: `an-${Date.now()}`, role: "assistant", text: "Great! What's your name?" }]);
    } else {
      setMessages((p) => [...p, { id: Date.now().toString(), role: "user", text: "Maybe later" }]);
      setIsTyping(true);
      await delay(600);
      setIsTyping(false);
      setMessages((p) => [...p, {
        id: `nc-${Date.now()}`, role: "assistant",
        text: "No problem! I'm still here if you have questions. Or call us anytime at 817-265-5762 — we answer 24/7.",
      }]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const showInitialPrompts = messages.length === 1 && stage === "chat";
  const inputLocked = isTyping || stage === "done";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-elegant)]"
            style={{ bottom: "5rem", right: "1rem", width: "min(92vw, 380px)", maxHeight: "min(calc(100dvh - 120px), 560px)" }}
            role="dialog" aria-modal="true" aria-label="Clara's CareTeam AI assistant"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border bg-primary px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Clara&apos;s Care Assistant</div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-[10px] font-medium text-white/70">Online &middot; Same-day placement available</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white/70 hover:bg-white/15 hover:text-white" aria-label="Close chat">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary" : "bg-secondary"}`}>
                      {msg.role === "user" ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <div className={`max-w-[78%] flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${msg.role === "user" ? "rounded-tr-sm bg-primary text-white" : "rounded-tl-sm bg-secondary text-foreground"}`}>
                        {msg.text}
                      </div>

                      {msg.isCapture && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-xl border border-green-200 bg-green-50 p-3">
                          <a href={`tel:${OFFICE.replace(/-/g, "")}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white">
                            <Phone className="h-3.5 w-3.5" /> Call Now &middot; {OFFICE}
                          </a>
                        </motion.div>
                      )}

                      {msg.isUrgent && msg.role === "assistant" && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full rounded-xl border border-accent/30 bg-accent/10 p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Zap className="h-3.5 w-3.5 text-accent-foreground" />
                            <span className="text-[11px] font-extrabold text-accent-foreground uppercase tracking-wide">We can help immediately</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <a href={`tel:${OFFICE.replace(/-/g, "")}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white">
                              <Phone className="h-3.5 w-3.5" /> Call {OFFICE}
                            </a>
                            <a href="/contact" className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary">
                              Request Care Online
                            </a>
                          </div>
                        </motion.div>
                      )}

                      {msg.buttons && msg.buttons.length > 0 && (
                        <div className="flex flex-col gap-1.5 w-full">
                          {msg.buttons.map((btn) => (
                            <button key={btn.value} onClick={() => handleButtonAction(btn.value)}
                              className="w-full rounded-full border border-primary/30 bg-white px-4 py-2 text-left text-xs font-semibold text-primary hover:bg-secondary active:scale-[0.98]">
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {msg.followUps && msg.followUps.length > 0 && stage === "chat" && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {msg.followUps.map((fu) => (
                            <button key={fu} onClick={() => sendMessage(fu)}
                              className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/30 hover:text-primary active:scale-[0.97]">
                              {fu}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 0.2, 0.4].map((d) => (
                        <motion.span key={d} className="block h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                          animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: d }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {showInitialPrompts && (
              <div className="shrink-0 border-t border-border px-4 pb-2 pt-2.5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick questions</p>
                <div className="flex flex-wrap gap-1.5">
                  {INITIAL_PROMPTS.map((p) => (
                    <button key={p} onClick={() => sendMessage(p)}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-primary active:scale-[0.97]">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="shrink-0 border-t border-border bg-white px-3 py-3">
              <div className="flex items-center gap-2">
                <SpeakToUsButton onTranscript={(t) => { setInput(t); sendMessage(t); }} />
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={stage === "capture_name" ? "Your name…" : stage === "capture_contact" ? "Phone or email…" : stage === "done" ? "Thanks! We'll be in touch" : "Ask about caregivers, services, availability…"}
                  disabled={inputLocked}
                  className="flex-1 min-w-0 rounded-full border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                />
                <button type="submit" disabled={!input.trim() || inputLocked}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40" aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-elegant)] hover:scale-105 active:scale-95"
        style={{ right: "1rem", bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))", background: "oklch(0.74 0.14 75)" }}
        aria-label={open ? "Close care assistant" : "Open care assistant"}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="h-6 w-6 text-black" /></motion.span>
            : <motion.span key="h" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Heart className="h-6 w-6 text-black" /></motion.span>
          }
        </AnimatePresence>
      </motion.button>
    </>
  );
}
