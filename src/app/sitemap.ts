import { MetadataRoute } from "next";

const BASE = "https://www.claracareteam.com";
const NOW = new Date().toISOString();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Root / homepage ──────────────────────────────────────────
    { url: BASE,                            lastModified: NOW, changeFrequency: "weekly",  priority: 1.0 },

    // ── Homepage section anchors ─────────────────────────────────
    { url: `${BASE}/#services`,             lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/#solutions`,            lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/#process`,              lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/#why`,                  lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/#emergency`,            lastModified: NOW, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/#contact`,              lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },

    // ── Platform pages ───────────────────────────────────────────
    { url: `${BASE}/residential-placement`, lastModified: NOW, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/care-monitoring`,       lastModified: NOW, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/care-tools`,            lastModified: NOW, changeFrequency: "monthly", priority: 0.80 },
    { url: `${BASE}/insights`,              lastModified: NOW, changeFrequency: "monthly", priority: 0.80 },
    { url: `${BASE}/compliance`,            lastModified: NOW, changeFrequency: "monthly", priority: 0.90 },
  ];
}
