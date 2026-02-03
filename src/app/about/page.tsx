import { AboutClient } from "./AboutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About IGAC | Forging the Diplomats of Tomorrow",
    description: "Learn more about the International Global Affairs Council (IGAC), our mission, vision, and the journey of South East Asia's premier Model United Nations organization.",
    openGraph: {
        title: "About IGAC | Forging the Diplomats of Tomorrow",
        description: "Discover our mission to empower youth through diplomacy and leadership.",
        url: "https://igac.org/about",
        siteName: "IGAC",
        images: [
            {
                url: "/logo.png",
                width: 800,
                height: 600,
                alt: "IGAC Logo",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "About IGAC | Forging the Diplomats of Tomorrow",
        description: "Discover our mission to empower youth through diplomacy.",
        images: ["/logo.png"],
    },
};

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-24 pb-20 bg-background font-sans selection:bg-primary/30 relative">
            <AboutClient />
        </main>
    );
}
