import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://igac.info"),
  title: "IGAC | International Global Affairs Council",
  description: "Architecting the next era of global leadership. IGAC is South East Asia's premier Model UN platform, empowering 4,000+ youth through high-stakes diplomacy and strategic negotiation.",
  keywords: ["IGAC", "MUN", "Model United Nations", "Diplomacy", "International Global Affairs Council", "Dhaka", "South East Asia"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "IGAC | International Global Affairs Council",
    description: "Architecting the next era of global leadership. IGAC is South East Asia's premier Model UN platform, empowering 4,000+ youth through high-stakes diplomacy and strategic negotiation.",
    url: "https://igac.info",
    siteName: "IGAC",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { SpotlightEffect } from "@/components/motion/spotlight-effect";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <SpotlightEffect className="min-h-screen flex flex-col">
          <SmoothScroll>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </SmoothScroll>
        </SpotlightEffect>
      </body>
    </html>
  );
}
