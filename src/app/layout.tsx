import type { Metadata } from "next";
import "./globals.css";
import React from 'react';
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import { JetBrains_Mono, Pirata_One, UnifrakturMaguntia } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const pirataOne = Pirata_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gothic",
});

const unifrakturMaguntia = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "HYPER$LUMP // DIGITAL ASSETS",
  description: "Industrial sound design textures, raw synthesis, and broken percussion.",
  icons: {
    icon: '/favicon.svg',
  },
};

import Navigation from "@/components/Navigation";
import HeroSchema from "@/components/HeroSchema";
import IndustrialTicker from "@/components/IndustrialTicker";
import ThemeToggle from "@/components/ThemeToggle";

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (dark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${jetbrainsMono.variable} ${pirataOne.variable} ${unifrakturMaguntia.variable} antialiased transition-colors duration-300`}>
        <div
          className="fixed inset-0 noise z-[100] pointer-events-none"
          style={{
            opacity: 'var(--noise-opacity)',
            mixBlendMode: 'var(--noise-blend)' as any
          }}
        />
        <CartProvider>
          <SmoothScroll>
            <CustomCursor />

            <div className="relative min-h-screen bg-[var(--background)]">
              {/* GLOBAL NAVIGATION SIDEBAR */}
              <Navigation />

              {/* MAIN CONTENT WRAPPER */}
              <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 md:ml-20 h-screen overflow-hidden">
                {/* GLOBAL HEADER */}
                <HeroSchema />

                {/* PAGE CONTENT */}
                <div className="flex-1 w-full min-h-0 overflow-y-auto custom-scrollbar">
                  {children}

                  {/* GLOBAL FOOTER */}
                  <footer className="footer-unit animate-fade-in delay-300 relative z-10 w-full overflow-hidden mt-auto">
                    <div className="w-full">
                      <IndustrialTicker />
                    </div>

                    {/* Indented Footer Content */}
                    <div className="p-8 md:p-12 bg-[var(--background)] border-t-2 border-black/10 dark:border-white/5">
                      <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-3 gap-12 items-center md:items-center">
                        {/* System Status (Left) */}
                        <div className="flex flex-col gap-4 font-mono w-full text-center md:text-left">
                          <div className="text-[10px] space-y-2 opacity-50 uppercase">
                            <p>&gt; INITIALIZING SYSTEM_CORE...</p>
                            <p>&gt; ASSET_LOAD: 100% [OK]</p>
                            <p>&gt; AUDIO_BUFFER: CACHED [OK]</p>
                            <p>&gt; SIGNAL_STATE: BROADCASTING</p>
                          </div>
                        </div>

                        {/* Spacer (Center) */}
                        <div className="hidden md:block" />

                        {/* Social & Credits (Right) */}
                        <div className="flex flex-col items-center md:items-end gap-3 w-full">
                          <div className="flex gap-6 mb-3">
                            {['INSTAGRAM', 'DISCORD', 'BANDCAMP'].map((platform) => (
                              <a
                                key={platform}
                                className="text-[10px] font-bold tracking-widest hover:text-primary transition-all underline decoration-primary/20 hover:decoration-primary"
                                href="#"
                              >
                                {platform}
                              </a>
                            ))}
                          </div>
                          <p className="text-[9px] opacity-40 font-mono tracking-tighter uppercase text-center md:text-right">
                            ©2026 HYPER$LUMP // CORTEX_SYNTHESIS_HUB // ALL_RIGHTS_RESERVED
                          </p>
                          <div className="pt-1">
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>
                    </div>
                  </footer>
                </div>
              </main>
            </div>

            <CartDrawer />
          </SmoothScroll>
        </CartProvider>
      </body>
    </html>
  );
}
