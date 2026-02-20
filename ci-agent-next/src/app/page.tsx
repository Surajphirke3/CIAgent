import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Workflow from "@/components/sections/Workflow";
import Architecture from "@/components/sections/Architecture";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Problem />
      <Workflow />
      <Architecture />
      <CTA />
      <Footer />
    </main>
  );
}
