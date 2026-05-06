"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone, Bot, User, Zap } from "lucide-react";
import { matchFAQ, detectUrgency } from "@/lib/faqData";
import SpeakToUsButton from "./SpeakToUsButton";

const OFFICE = "817-548-1986";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  isUrgent?: boolean;
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  text: "Hi! I'm Clara's virtual assistant 👋 I can answer questions about our services, coverage, pricing, and more. How can I help you today?",
};

const FALLBACK =
  "I'm not sure about that specific question, but our team can answer it directly. Call us at 817-548-1986 or fill out the Get Care Now form — we respond fast!";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));

    const isUrgent = detectUrgency(text);
    const match = matchFAQ(text);

    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: match?.answer ?? FALLBACK,
      isUrgent: isUrgent || match?.urgency,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, reply]);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    sendMessage(transcript);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 right-4 z-50 flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-elegant)] sm:right-6"
            role="dialog"
            aria-modal="true"
            aria-label="Clara's CareTeam AI assistant"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Clara's Assistant</div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-[10px] font-medium text-white/70">Online · Answers instantly</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[360px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                      msg.role === "user" ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-tr-sm bg-primary text-white"
                          : "rounded-tl-sm bg-secondary text-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Urgency escalation card */}
                    {msg.isUrgent && msg.role === "assistant" && (
                      <div className="w-full rounded-xl border border-accent/30 bg-accent/8 p-3 mt-1">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Zap className="h-3.5 w-3.5 text-accent" />
                          <span className="text-[11px] font-extrabold text-accent uppercase tracking-wide">
                            Need immediate help?
                          </span>
                        </div>
                        <a
                          href={`tel:${OFFICE.replace(/-/g, "")}`}
                          className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white w-full"
                          data-track="chat-urgent-call"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call Now — {OFFICE}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-foreground/40"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="border-t border-border px-4 py-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  "Same-day coverage?",
                  "How are staff vetted?",
                  "Memory care staff?",
                  "Coverage areas?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-4 py-3">
              <SpeakToUsButton onTranscript={handleVoiceTranscript} compact />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
                aria-label="Your message"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary-deep disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-elegant)] sm:right-6"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        data-track="chat-bubble"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing dot (unread indicator) */}
        {!open && (
          <motion.span
            className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-accent"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>
    </>
  );
}
