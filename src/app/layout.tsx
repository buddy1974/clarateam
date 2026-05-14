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
