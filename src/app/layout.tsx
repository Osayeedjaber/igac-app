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
  metadataBase: new URL("https://igac.org"),
  title: "IGAC | International Global Affairs Council",
  description: "The biggest Model United Nations conference in South East Asia. Empowering the next generation of leaders.",
  keywords: ["IGAC", "MUN", "Model United Nations", "Diplomacy", "International Global Affairs Council", "Dhaka", "South East Asia"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "IGAC | International Global Affairs Council",
    description: "The biggest Model United Nations conference in South East Asia. Empowering the next generation of leaders.",
    url: "https://igac.org",
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

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SpotlightEffect } from "@/components/motion/spotlight-effect";

// ... existing code ...

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
            <Navbar />
            {children}
            <Footer />
          </SmoothScroll>
        </SpotlightEffect>
      </body>
    </html>
  );
}
