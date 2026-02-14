import type { Metadata } from "next";
import "./globals.css";
import React from 'react';
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";
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
            {children}
            <CartDrawer />
          </SmoothScroll>
        </CartProvider>
      </body>
    </html>
  );
}
