import type { Metadata } from "next";
import "./globals.css";
import React from 'react';
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import CustomCursor from "@/components/CustomCursor";
import PreviewPlayerDock from "@/components/PreviewPlayerDock";
import { PreviewPlayerProvider } from "@/components/PreviewPlayerProvider";
import { Geist, Geist_Mono, UnifrakturMaguntia, Jacquard_24 } from "next/font/google";

import SmoothScroll from "@/components/SmoothScroll";
import MainContent from "@/components/MainContent";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const unifrakturMaguntia = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const jacquard24 = Jacquard_24({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  // Default to dark unless specifically set to light
                  var dark = saved !== 'light';
                  if (dark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${unifrakturMaguntia.variable} ${jacquard24.variable} antialiased transition-colors duration-300`}>
        <CartProvider>
          <PreviewPlayerProvider>
            <SmoothScroll>
              <CustomCursor />

              <div className="relative min-h-screen bg-transparent flex flex-col">
                {/* MAIN CONTENT WRAPPER */}
                <MainContent>
                  {children}
                </MainContent>
              </div>

              <PreviewPlayerDock />
              <CartDrawer />
            </SmoothScroll>
          </PreviewPlayerProvider>
        </CartProvider>
      </body>
    </html>
  );
}
