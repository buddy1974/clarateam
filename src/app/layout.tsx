import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://www.claracareteam.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clara's CareTeam | Residential Care Staffing DFW — Arlington, Fort Worth, Dallas",
    template: "%s | Clara's CareTeam",
  },
  description:
    "Clara's CareTeam provides compliance-first residential care staffing across DFW — Arlington, Fort Worth, Dallas, Grand Prairie & 35+ neighborhoods. PRN coverage, certified caregivers, memory care & fractional leadership. Call 817-548-1986.",
  keywords: [
    "residential care staffing DFW",
    "caregiver staffing Arlington TX",
    "PRN coverage Fort Worth",
    "residential care home staff Dallas",
    "memory care staffing Grand Prairie",
    "assisted living staffing Texas",
    "home care staffing DFW",
    "certified caregiver placement Arlington",
    "licensed caregiver agency Fort Worth",
  ],
  authors: [{ name: "Clara's CareTeam, LLC" }],
  creator: "Clara's CareTeam",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Clara's CareTeam",
    title: "Clara's CareTeam | Residential Care Staffing DFW",
    description:
      "Family-owned, fully vetted caregivers across DFW — Arlington, Fort Worth, Dallas & beyond. Peace of mind, every shift.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Clara's CareTeam — Residential Care Staffing DFW",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clara's CareTeam | Residential Care Staffing DFW",
    description:
      "Family-owned care staffing. Fully vetted professionals. Coverage across Arlington, Fort Worth, Dallas and 35+ DFW neighborhoods.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": SITE_URL,
  name: "Clara's CareTeam, LLC",
  description:
    "Family-owned residential care staffing agency serving DFW. PRN coverage, certified caregivers, memory care specialists & fractional leadership.",
  url: SITE_URL,
  telephone: "+18175481986",
  email: "info@claracareteam.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "P.O. Box 200455",
    addressLocality: "Arlington",
    addressRegion: "TX",
    postalCode: "76006",
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: 32.7357, longitude: -97.1081 },
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
