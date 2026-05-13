export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  urgency?: boolean;
}

export interface FAQCategory {
  id: string;
  label: string;
  items: FAQItem[];
}

export const faqData: FAQCategory[] = [
  {
    id: "availability",
    label: "Urgency & Availability",
    items: [
      {
        id: "same-day",
        question: "Can you provide same-day or emergency coverage?",
        answer:
          "Yes — same-day and emergency coverage is our specialty. We operate 24/7 and can typically have a qualified caregiver at your facility within hours. Call 817-265-5762 right now and we'll start matching immediately.",
        keywords: ["today", "now", "urgent", "asap", "emergency", "same day", "immediately", "tonight", "right now", "fast", "quick"],
        urgency: true,
      },
      {
        id: "hours",
        question: "Are you available nights, weekends, and holidays?",
        answer:
          "Absolutely. Our team is on-call 24 hours a day, 7 days a week, 365 days a year — including all holidays. Residential care homes never close, and neither do we.",
        keywords: ["hours", "night", "weekend", "holiday", "24/7", "always", "open", "available", "sunday", "saturday"],
      },
      {
        id: "minimum",
        question: "Is there a minimum number of hours or shifts required?",
        answer:
          "No minimums. Whether you need coverage for a single 4-hour shift or long-term ongoing staffing, we accommodate every request without contractual obligations.",
        keywords: ["minimum", "minimum hours", "contract", "commitment", "short", "one shift", "one day"],
      },
    ],
  },
  {
    id: "safety",
    label: "Safety & Compliance",
    items: [
      {
        id: "background",
        question: "How do you screen your caregivers?",
        answer:
          "Every caregiver passes our rigorous 6-point Due Diligence process: (1) Criminal background check, (2) Sex Offender Registry verification, (3) OIG/LEIE exclusion check, (4) Reference verification, (5) Employment history confirmation, and (6) 10-panel drug screening. We also verify EMR, MAR, and NAR competencies.",
        keywords: ["screen", "background", "check", "safe", "vetted", "verified", "criminal", "drug", "test", "qualify"],
      },
      {
        id: "compliance",
        question: "Are your staff TWC and survey-ready?",
        answer:
          "Yes. All placements are aligned with Texas Workforce Commission (TWC) requirements and Texas residential care home survey standards. We handle compliance documentation so you can focus on resident care.",
        keywords: ["twc", "survey", "compliance", "texas", "regulation", "license", "certified", "qualified", "regulation"],
      },
      {
        id: "insurance",
        question: "Are your caregivers covered by workers' comp and liability insurance?",
        answer:
          "Yes. All staff placed through Clara's CareTeam are covered by workers' compensation and liability insurance, protecting both your facility and the caregivers.",
        keywords: ["insurance", "workers comp", "liability", "covered", "protection", "risk"],
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    items: [
      {
        id: "prn",
        question: "What is PRN coverage?",
        answer:
          "PRN (Latin: pro re nata, 'as needed') staffing means on-demand coverage with no ongoing commitment. You call us when you have a gap — shift callout, vacancy, surge demand — and we fill it promptly.",
        keywords: ["prn", "on demand", "as needed", "fill in", "cover", "substitute", "replacement"],
      },
      {
        id: "memory-care",
        question: "Do you have memory care specialists?",
        answer:
          "Yes. We maintain a dedicated pool of caregivers trained in dementia and Alzheimer's care, including behavioral redirection, validation therapy, and dignity-centered care techniques.",
        keywords: ["memory", "dementia", "alzheimer", "cognitive", "behavioral", "mental", "specialist"],
      },
      {
        id: "leadership",
        question: "Can you provide temporary management or administrative staff?",
        answer:
          "Yes — we call this Fractional Leadership. We can place short-term administrators, Directors of Nursing (DONs), and operational managers to keep your facility running smoothly during transitions or vacancies.",
        keywords: ["manager", "admin", "administrator", "don", "director", "leadership", "management", "temporary", "fractional"],
      },
      {
        id: "care-types",
        question: "What types of caregivers do you staff?",
        answer:
          "We staff Certified Nursing Assistants (CNAs), Home Health Aides (HHAs), Personal Care Assistants (PCAs), companion caregivers, medication aides (MAR/NAR certified), and memory care specialists — all for residential care home settings.",
        keywords: ["cna", "hha", "pca", "aide", "nurse", "caregiver", "companion", "medication", "type", "kind", "what"],
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing & Flexibility",
    items: [
      {
        id: "cost",
        question: "How does pricing work?",
        answer:
          "Pricing is based on care type, shift length, and urgency. We offer competitive DFW market rates with no hidden fees. Contact us at 817-265-5762 or info@claracareteam.com for a same-day quote.",
        keywords: ["cost", "price", "pricing", "rate", "fee", "charge", "pay", "much", "expensive", "affordable", "quote"],
      },
      {
        id: "contract",
        question: "Do I need to sign a long-term contract?",
        answer:
          "No long-term contracts required. We offer flexible, as-needed staffing with no minimums. You only pay for the coverage you use.",
        keywords: ["contract", "commit", "long term", "lock in", "cancel", "flexible", "obligation"],
      },
    ],
  },
  {
    id: "process",
    label: "Process",
    items: [
      {
        id: "how-it-works",
        question: "How does the matching process work?",
        answer:
          "It's simple: (1) You contact us with your needs, (2) We assess your care environment and requirements, (3) We match a vetted caregiver from our active pool, (4) Care begins. For urgent requests, we move through all four steps in hours, not days.",
        keywords: ["process", "how", "work", "start", "begin", "steps", "match", "find"],
      },
      {
        id: "areas",
        question: "What areas of DFW do you serve?",
        answer:
          "We serve 35+ communities across the Dallas–Fort Worth Metroplex, including Arlington, Fort Worth, Dallas, Grand Prairie, Mansfield, Irving, Cedar Hill, Duncanville, DeSoto, Euless, Bedford, Hurst, Colleyville, Keller, Southlake, Grapevine, and many more.",
        keywords: ["area", "location", "serve", "cover", "dfw", "dallas", "fort worth", "arlington", "grand prairie", "where", "city", "neighborhood"],
      },
      {
        id: "get-started",
        question: "How do I get started?",
        answer:
          "Call or text us at 817-265-5762, email info@claracareteam.com, or fill out the Get Care Now form above. We respond within minutes during business hours, and our on-call team handles urgent requests 24/7.",
        keywords: ["start", "begin", "sign up", "register", "contact", "get started", "first step", "onboard"],
      },
    ],
  },
];

/** Urgency keywords that trigger escalation */
export const URGENCY_KEYWORDS = [
  "today", "now", "urgent", "asap", "emergency",
  "immediately", "tonight", "right now", "fast", "help",
  "critical", "dying", "hospital", "crisis",
];

/** Find the best FAQ match for a user query */
export function matchFAQ(query: string): FAQItem | undefined {
  const q = query.toLowerCase().trim();
  let bestMatch: FAQItem | undefined;
  let bestScore = 0;

  for (const category of faqData) {
    for (const item of category.items) {
      const score = item.keywords.filter((kw) => q.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  return bestScore > 0 ? bestMatch : undefined;
}

/** Detect urgency in user input */
export function detectUrgency(query: string): boolean {
  const q = query.toLowerCase();
  return URGENCY_KEYWORDS.some((kw) => q.includes(kw));
}
