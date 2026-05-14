import { MetadataRoute } from "next";

const BASE = "https://www.claracareteam.com";
const NOW = new Date().toISOString();

/**
 * Next.js dynamic sitemap — served at /sitemap.xml
 *
 * For a single-page site we include the root URL at priority 1.0
 * plus each major section anchor so crawlers can discover content
 * depth and map it to user intent queries.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Root page ────────────────────────────────────────────────
    {
      url: BASE,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // ── Page sections (anchor deep-links) ────────────────────────
    {
      url: `${BASE}/#services`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/#process`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/#why`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/#emergency`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/#contact`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];
}
