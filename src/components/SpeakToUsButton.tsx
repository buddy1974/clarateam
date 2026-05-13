"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "idle" | "listening" | "done" | "error" | "unsupported";

interface Props {
  onTranscript?: (text: string) => void;
  compact?: boolean;
}

// Web Speech API type shim
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export default function SpeakToUsButton({ onTranscript, compact = false }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported = () =>
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startListening = () => {
    if (!isSupported()) {
      setStatus("unsupported");
      setModalOpen(true);
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition! || window.webkitSpeechRecognition!;
    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = false;

    recog.onresult = (e: SpeechRecognitionEvent) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      setTranscript(text);
      setStatus("done");
    };

    recog.onerror = () => setStatus("error");
    recog.onend = () => {
      if (status === "listening") setStatus("idle");
    };

    recogRef.current = recog;
    recog.start();
    setStatus("listening");
    setModalOpen(true);
  };

  const stopListening = () => {
    recogRef.current?.stop();
    setStatus("idle");
  };

  const handleConfirm = () => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
    setModalOpen(false);
    setTranscript("");
    setStatus("idle");
  };

  const handleClose = () => {
    recogRef.current?.abort();
    setModalOpen(false);
    setTranscript("");
    setStatus("idle");
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={startListening}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:border-primary/40 hover:text-primary"
        aria-label="Speak your question"
        title="Click to speak"
      >
        <Mic className="h-4 w-4" />
        {/* Voice modal (shared) */}
        <VoiceModal
          open={modalOpen}
          status={status}
          transcript={transcript}
          onStop={stopListening}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={startListening}
        className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-secondary/50 px-4 py-2 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-secondary"
      >
        <Mic className="h-4 w-4" />
        Speak to us
      </button>
      <VoiceModal
        open={modalOpen}
        status={status}
        transcript={transcript}
        onStop={stopListening}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    </>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  status: Status;
  transcript: string;
  onStop: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

function VoiceModal({ open, status, transcript, onStop, onConfirm, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          aria-modal="true"
          role="dialog"
          aria-label="Voice recorder"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-[var(--shadow-elegant)]"
            initial={{ y: 40, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-foreground/40 hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center gap-4 text-center">
              {status === "unsupported" ? (
                <>
                  <AlertCircle className="h-12 w-12 text-destructive/70" />
                  <h3 className="font-serif text-lg font-bold text-primary">
                    Voice not supported
                  </h3>
                  <p className="text-sm text-foreground/65">
                    Your browser doesn't support voice input. Please use the text field, or call us at{" "}
                    <a href="tel:18172655762" className="font-bold text-primary">817-265-5762</a>.
                  </p>
                </>
              ) : status === "listening" ? (
                <>
                  {/* Animated mic */}
                  <div className="relative">
                    <motion.div
                      className="absolute -inset-4 rounded-full bg-accent/20"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute -inset-2 rounded-full bg-accent/30"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-gold)]">
                      <Mic className="h-7 w-7" />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-primary">Listening…</h3>
                  <p className="text-sm text-foreground/65">Speak your question clearly</p>
                  <button
                    onClick={onStop}
                    className="mt-2 flex items-center gap-2 rounded-full border-2 border-border px-6 py-2.5 text-sm font-bold text-foreground/70 hover:border-destructive hover:text-destructive"
                  >
                    <MicOff className="h-4 w-4" /> Stop
                  </button>
                </>
              ) : status === "done" ? (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-primary">Got it!</h3>
                  <div className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-left text-sm text-foreground">
                    "{transcript}"
                  </div>
                  <div className="flex w-full gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 rounded-full border-2 border-border py-2.5 text-sm font-bold text-foreground/70"
                    >
                      Retry
                    </button>
                    <button
                      onClick={onConfirm}
                      className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white shadow-[var(--shadow-soft)]"
                    >
                      Send →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-destructive/70" />
                  <h3 className="font-serif text-lg font-bold text-primary">Couldn't hear you</h3>
                  <p className="text-sm text-foreground/65">Please try again or type your question.</p>
                  <button
                    onClick={onClose}
                    className="rounded-full border-2 border-border px-6 py-2.5 text-sm font-bold text-foreground/70"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
