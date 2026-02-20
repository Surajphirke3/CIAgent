import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google"; // Import Space Grotesk
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] }); // Configure font

export const metadata: Metadata = {
  title: "CIAgent | AI Competitor Intelligence Platform",
  description: "Turn Competitor Signals into Strategic Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${spaceGrotesk.className} antialiased bg-background-dark text-slate-100 selection:bg-primary/30 min-h-screen relative overflow-x-hidden`}>
        {/* Background Elements */}
        <div className="fixed inset-0 grid-overlay pointer-events-none"></div>
        <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none"></div>
        {children}
      </body>
    </html>
  );
}
