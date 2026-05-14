import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import TrustBar from "@/components/sections/TrustBar";
import EmergencyWidget from "@/components/sections/EmergencyWidget";
import ServicesGrid from "@/components/sections/ServicesGrid";
import SolutionsPlatform from "@/components/sections/SolutionsPlatform";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";
import CTASection from "@/components/sections/CTASection";
import AIChatWidget from "@/components/AIChatWidget";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <EmergencyWidget />
        <ServicesGrid />
        <SolutionsPlatform />
        <ProcessTimeline />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      <