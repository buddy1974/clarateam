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
const SITE_NAME = "Clara's CareTeam";
const PHONE = "817-265-5762";
const PHONE_E164 = "+18172655762";
const EMAIL = "info@claracareteam.com";

// ─── DFW service area cities ────────────────────────────────────────────────
const DFW_CITIES = [
  "Arlington", "Fort Worth", "Dallas", "Grand Prairie", "Mansfield",
  "Burleson", "Kennedale", "Hurst", "Euless", "Bedford", "Colleyville",
  "Grapevine", "Southlake", "Keller", "North Richland Hills", "Haltom City",
  "Richland Hills", "Watauga", "Saginaw", "Lake Worth", "White Settlement",
  "Benbrook", "Crowley", "Joshua", "Cleburne", "Irving", "Las Colinas",
  "Coppell", "Carrollton", "Flower Mound", "Lewisville", "Denton",
  "Garland", "Mesquite", "Duncanville", "DeSoto", "Cedar Hill",
  "Midlothian", "Waxahachie", "Ennis", "Plano", "Richardson", "Allen",
];

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Residential Care Staffing DFW — Arlington, Fort Worth, Dallas`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Clara's CareTeam is the DFW-area residential care staffing agency families and facilities trust. PRN coverage, certified CNAs, HHAs, memory care specialists & fractional DONs across Arlington, Fort Worth, Dallas, Grand Prairie and 35+ DFW cities. Available 24/7. Call 817-265-5762.",
  keywords: [
    // Core service + geo combos
    "residential care staffing DFW",
    "residential care home staffing Arlington TX",
    "caregiver staffing Fort Worth TX",
    "caregiver agency Dallas TX",
    "PRN coverage DFW",
    "PRN caregiver Arlington",
    "emergency caregiver coverage Fort Worth",
    "same-day caregiver placement DFW",
    "home care staffing Grand Prairie TX",
    "assisted living staffing Arlington TX",
    "assisted living staffing Fort Worth",
    "memory care staffing DFW",
    "dementia caregiver staffing Arlington",
    "Alzheimer's caregiver Fort Worth",
    "CNA staffing DFW",
    "certified nursing assistant agency Arlington",
    "HHA staffing Fort Worth",
    "home health aide placement DFW",
    "fractional Director of Nursing DFW",
    "fractional DON Texas",
    "residential care administrator DFW",
    "survey-ready staffing Texas",
    "TWC compliant caregivers",
    "vetted caregiver agency DFW",
    "background checked caregivers Arlington",
    "licensed caregiver placement Dallas Fort Worth",
    "24/7 caregiver agency DFW",
    "on-call caregiver staffing Fort Worth",
    "family-owned caregiver agency Arlington TX",
    "Clara's CareTeam",
    "claracareteam",
    // City variants
    ...DFW_CITIES.map(c => `caregiver staffing ${c}`),
  ],
  authors: [{ name: "Clara's CareTeam, LLC" }],
  creator: "Clara's CareTeam, LLC",
  publisher: "Clara's CareTeam, LLC",
  category: "Healthcare Staffing",
  classification: "Residential Care Staffing Agency",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Residential Care Staffing — Arlington, Fort Worth, Dallas`,
    description:
      "Family-owned, fully vetted caregivers across DFW. PRN coverage, memory care specialists & fractional leadership. Same-day placements. Call 817-265-5762.",
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
    title: `${SITE_NAME} | Residential Care Staffing DFW`,
    description:
      "24/7 caregiver staffing across Arlington, Fort Worth, Dallas and 35+ DFW cities. Background-checked, TWC-compliant, same-day available.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    // Geographic targeting
    "geo.region": "US-TX",
    "geo.placename": "Arlington, Texas",
    "geo.position": "32.7357;-97.1081",
    "ICBM": "32.7357, -97.1081",
    // Business signals
    "og:phone_number": PHONE,
    "og:email": EMAIL,
    "og:locality": "Arlington",
    "og:region": "TX",
    "og:country-name": "USA",
    "og:postal-code": "76006",
  },
};

// ─── Structured Data (@graph) ────────────────────────────────────────────────
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    // 1. LocalBusiness (primary)
    {
      "@type": ["LocalBusiness", "EmploymentAgency"],
      "@id": `${SITE_URL}/#business`,
      name: "Clara's CareTeam, LLC",
      alternateName: ["Clara's CareTeam", "ClarasCareTeam", "ClaraCareTeam DFW"],
      description:
        "Family-owned residential care staffing agency serving the Dallas–Fort Worth Metroplex. We provide PRN coverage, certified CNAs, HHAs, PCAs, memory care specialists, and fractional Directors of Nursing to residential care homes, assisted living facilities, and private clients across DFW.",
      url: SITE_URL,
      telephone: PHONE_E164,
      email: EMAIL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo2.png`,
        width: 400,
        height: 160,
      },
      image: `${SITE_URL}/og-image.jpg`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "P.O. Box 200455",
        addressLocality: "Arlington",
        addressRegion: "TX",
        postalCode: "76006",
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 32.7357,
        longitude: -97.1081,
      },
      areaServed: DFW_CITIES.map(city => ({
        "@type": "City",
        name: city,
        containedInPlace: { "@type": "State", name: "Texas" },
      })),
      serviceArea: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 32.7357,
          longitude: -97.1081,
        },
        geoRadius: "80000",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      priceRange: "$$",
      currenciesAccepted: "USD",
      paymentAccepted: "Cash, Check, ACH, Credit Card",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Residential Care Staffing Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "PRN / Emergency Coverage",
              description:
                "Last-minute same-day caregiver coverage for residential care homes across DFW. Available 24/7 including weekends and holidays.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Certified Caregiver Placement",
              description:
                "CNA, HHA, PCA, and companion caregiver staffing matched to your facility culture and documentation requirements.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Memory Care Specialist Staffing",
              description:
                "Dementia and Alzheimer's trained caregivers experienced in behavioral redirection, validation therapy, and dignity-centered care.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Fractional Management",
              description:
                "Short-term Administrators, Directors of Nursing (DONs), and operational managers to keep your facility survey-ready during transitions.",
            },
          },
        ],
      },
      sameAs: [
        "https://www.facebook.com/claracareteam",
        "https://www.linkedin.com/company/claracareteam",
      ],
    },

    // 2. WebSite (enables Google Sitelinks Search Box)
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Clara's CareTeam",
      description: "DFW Residential Care Staffing — Arlington, Fort Worth, Dallas",
      publisher: { "@id": `${SITE_URL}/#business` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },

    // 3. BreadcrumbList
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/#services` },
        { "@type": "ListItem", position: 3, name: "How It Works", item: `${SITE_URL}/#process` },
        { "@type": "ListItem", position: 4, name: "Contact", item: `${SITE_URL}/#contact` },
      ],
    },
  ],
};

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#140a1e" />
        {/* Geographic meta */}
        <meta name="geo.region" content="US-TX" />
        <meta name="geo.placename" content="Arlington, Texas" />
        <meta name="geo.position" content="32.7357;-97.1081" />
        <meta name="ICBM" content="32.7357, -97.1081" />
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
