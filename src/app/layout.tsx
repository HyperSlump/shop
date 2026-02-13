import type { Metadata } from "next";
import "./globals.css";
import React from 'react';
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
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
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`${jetbrainsMono.variable} ${pirataOne.variable} ${unifrakturMaguntia.variable} bg-background-light dark:bg-background-dark text-black dark:text-white font-mono selection:bg-primary selection:text-black`}>
        <div className="fixed inset-0 noise z-50 pointer-events-none"></div>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
