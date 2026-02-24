import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Workflow from "@/components/sections/Workflow";
import Architecture from "@/components/sections/Architecture";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";
import LandingBackgroundAnimation from "@/components/ui/LandingBackgroundAnimation";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <LandingBackgroundAnimation />
      <div className="relative z-10 w-full">
        <Navbar />
        <Hero />
        <Problem />
        <Workflow />
        <Architecture />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
