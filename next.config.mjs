/** @type {import('next').NextConfig} */
const nextConfig = {
  // csstype 3.2.x has a JSDoc parsing edge-case that trips TS 5.x strict mode.
  // skipLibCheck is set in tsconfig but the Next build worker runs its own tsc
  // pass. Disable type-checking in the build; CI/pre-commit handles it separately.
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  // ── Output ────────────────────────────────────────────────────
  // standalone bundles only what is needed — smaller deploy artifact,
  // faster cold starts, reduced CPU during packaging step
  output: "standalone",

  // ── Images ───────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    // Aggressively cache optimized images at the CDN layer
    minimumCacheTTL: 2592000, // 30 days
    // Limit device sizes to reduce the number of variants generated
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 128, 256],
  },

  // ── Compiler ─────────────────────────────────────────────────
  // Remove console.* calls from production bundles
  compiler: {
    removeConsole: { exclude: ["error"] },
  },

  // ── Headers already handled via vercel.json ──────────────────

  // ── Misc ─────────────────────────────────────────────────────
  poweredByHeader: false, // removes X-Powered-By response header (minor)
};

export default nextConfig;
