import Image from "next/image";
import QRCode from "qrcode";
import { Shield, Smartphone, CheckCircle2 } from "lucide-react";

export default async function SetupTOTP() {
  const secret = process.env.TOTP_SECRET ?? "";
  const token  = process.env.SETUP_TOKEN  ?? "";

  // Page only active when SETUP_TOKEN is set
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center"
        style={{ background: "oklch(0.12 0.10 332)" }}>
        <p className="text-white/40 text-sm">Setup not available.</p>
      </div>
    );
  }

  // Generate QR code as base64 data URL server-side (no external API)
  const otpauthUrl = `otpauth://totp/ClaraCare%20OS?secret=${secret}&issuer=ClaraCareTeam&algorithm=SHA1&digits=6&period=30`;
  let qrDataUrl = "";
  if (secret) {
    try {
      qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
        width: 220,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });
    } catch {
      qrDataUrl = "";
    }
  }

  const apps = [
    { name: "Google Authenticator", store: "App Store / Google Play" },
    { name: "Authy",                store: "App Store / Google Play" },
    { name: "Microsoft Authenticator", store: "App Store / Google Play" },
  ];

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, oklch(0.12 0.10 332) 0%, oklch(0.20 0.14 332) 55%, oklch(0.16 0.10 332) 100%)" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, oklch(0.74 0.14 75 / 0.25), transparent)" }} />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="inline-flex items-center rounded-3xl px-5 py-2 shadow-2xl"
            style={{ background: "oklch(0.74 0.14 75)", boxShadow: "0 0 60px oklch(0.74 0.14 75 / 0.50), 0 16px 40px rgba(0,0,0,0.60)" }}>
            <Image src="/logo2.png" alt="Clara's CareTeam" width={240} height={96} className="h-12 w-auto" priority />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-400/70" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">One-Time Setup</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.07)" }}>

          <h2 className="text-center font-serif text-xl font-bold text-white mb-1">Set Up Your Authenticator</h2>
          <p className="text-center text-xs text-white/45 mb-6">
            Each person does this once. Use any authenticator app.
          </p>

          {/* QR Code */}
          {qrDataUrl ? (
            <div className="flex flex-col items-center">
              <div className="rounded-xl bg-white p-3 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="TOTP QR Code" width={220} height={220} />
              </div>
              <p className="mt-3 text-center text-xs text-white/40">Scan with your authenticator app</p>

              {/* Manual entry fallback */}
              <div className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Or enter code manually</p>
                <p className="text-center font-mono text-sm font-bold tracking-widest text-amber-300 break-all">{secret}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="text-sm text-red-300 font-semibold">TOTP_SECRET not set in environment variables.</p>
              <p className="text-xs text-red-300/60 mt-1">Add TOTP_SECRET to Vercel → Project Settings → Environment Variables, then redeploy.</p>
            </div>
          )}

          {/* Steps */}
          <div className="mt-6 space-y-3">
            {[
              "Download any authenticator app (see below)",
              "Tap + or Add Account in the app",
              "Scan the QR code above",
              "The app will show a 6-digit code — use that to log in",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-400 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-white/65">{step}</p>
              </div>
            ))}
          </div>

          {/* App list */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-amber-400/70" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Compatible Apps</span>
            </div>
            <div className="space-y-2">
              {apps.map(({ name, store }) => (
                <div key={name} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400/60 shrink-0" />
                  <span className="text-sm text-white/70 font-semibold">{name}</span>
                  <span className="text-xs text-white/30 ml-auto">{store}</span>
                </div>
              ))}
            </div>
          </div>

          <a href="/admin/login"
            className="mt-6 flex w-full items-center justify-center rounded-full py-3 text-sm font-bold text-black transition-all hover:brightness-110"
            style={{ background: "oklch(0.74 0.14 75)" }}>
            Go to Login →
          </a>
        </div>

        <p className="mt-5 text-center text-[11px] text-white/20">
          Remove SETUP_TOKEN from Vercel env vars when all users have scanned.
        </p>
      </div>
    </div>
  );
}
