import Image from "next/image";
import { toDataURL } from "qrcode";
import { Shield, Smartphone, CheckCircle2 } from "lucide-react";

// Per-user TOTP secrets — these are baked in at build time for the setup page.
// Once everyone has scanned, remove SETUP_TOKEN from Vercel to disable this page.
const USERS = [
  { name: "kevin",   display: "Kevin James Dean",  secret: "2UCCHCUJFCDAF5VFCIXR" },
  { name: "jessica", display: "Jessica",            secret: "OG2ZDERALN2Q6BHUSTEL" },
  { name: "carter",  display: "Chantay Carter",     secret: "K6QF6IV33NMANL4V7FNH" },
];

async function makeQR(secret: string, account: string): Promise<string> {
  const url = `otpauth://totp/ClaraCare%20OS:${encodeURIComponent(account)}?secret=${secret}&issuer=ClaraCareTeam&algorithm=SHA1&digits=6&period=30`;
  try {
    return await toDataURL(url, { width: 200, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
  } catch {
    return "";
  }
}

export default async function SetupTOTP() {
  const token = process.env.SETUP_TOKEN ?? "";

  // Page only active when SETUP_TOKEN is set
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center"
        style={{ background: "oklch(0.12 0.10 332)" }}>
        <p className="text-white/40 text-sm">Setup not available.</p>
      </div>
    );
  }

  // Generate all QR codes server-side in parallel
  const usersWithQR = await Promise.all(
    USERS.map(async (u) => ({ ...u, qr: await makeQR(u.secret, u.display) }))
  );

  const apps = [
    "Google Authenticator",
    "Authy",
    "Microsoft Authenticator",
  ];

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, oklch(0.12 0.10 332) 0%, oklch(0.20 0.14 332) 55%, oklch(0.16 0.10 332) 100%)" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, oklch(0.74 0.14 75 / 0.25), transparent)" }} />

      <div className="relative w-full max-w-2xl">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="inline-flex items-center rounded-3xl px-5 py-2 shadow-2xl"
            style={{ background: "oklch(0.74 0.14 75)", boxShadow: "0 0 60px oklch(0.74 0.14 75 / 0.50), 0 16px 40px rgba(0,0,0,0.60)" }}>
            <Image src="/logo2.png" alt="Clara's CareTeam" width={240} height={96} className="h-12 w-auto" priority />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-400/70" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">One-Time Authenticator Setup</span>
          </div>
        </div>

        <p className="text-center text-sm text-white/50 mb-8">
          Each person scans <strong className="text-white/70">only their own QR code</strong>.
          Use Google Authenticator, Authy, or Microsoft Authenticator.
        </p>

        {/* Per-user QR cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {usersWithQR.map(({ name, display, secret, qr }) => (
            <div key={name} className="rounded-2xl border border-white/10 p-6 shadow-xl backdrop-blur-xl flex flex-col items-center gap-4"
              style={{ background: "rgba(255,255,255,0.07)" }}>
              <p className="text-sm font-bold text-white text-center">{display}</p>

              {qr ? (
                <>
                  <div className="rounded-xl bg-white p-2.5 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qr} alt={`QR for ${display}`} width={200} height={200} />
                  </div>
                  <div className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Manual key</p>
                    <p className="font-mono text-xs font-bold tracking-widest text-amber-300 break-all">{secret}</p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-red-300">QR generation failed</p>
              )}

              <p className="text-[10px] text-white/30 text-center">
                Login handle: <span className="text-white/50 font-mono">{name}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-8 rounded-2xl border border-white/10 p-6 backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Setup Steps</h3>
          <div className="space-y-3">
            {[
              "Download an authenticator app (see compatible apps below)",
              "Tap + or Add Account in the app",
              "Scan only YOUR QR code above — do not scan anyone else's",
              "The app will show a 6-digit code that changes every 30 seconds",
              "Use that code on the login page along with your name",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-400 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-white/65">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-amber-400/60" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/35">Compatible Apps</span>
            </div>
            {apps.map((app) => (
              <div key={app} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400/60 shrink-0" />
                <span className="text-xs text-white/60">{app}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <a href="/admin/login"
            className="rounded-full px-8 py-3 text-sm font-bold text-black transition-all hover:brightness-110"
            style={{ background: "oklch(0.74 0.14 75)" }}>
            Go to Login →
          </a>
        </div>

        <p className="mt-5 text-center text-[11px] text-white/20">
          Remove SETUP_TOKEN from Vercel env vars once everyone has scanned their QR code.
        </p>
      </div>
    </div>
  );
}
