import type { Metadata } from "next";
import TeamPage from "./TeamClient";

export const metadata: Metadata = {
    title: "The Team | IGAC Leadership",
    description: "Meet the Governing Body, Core Panel, and Department Heads behind the International Global Affairs Council. The visionaries driving our mission.",
    openGraph: {
        title: "The Team | IGAC Leadership",
        description: "Meet the dedicated team behind IGAC.",
        url: "https://igac.org/team",
        siteName: "IGAC",
        images: [
            {
                url: "/governing-panel/president.jpg", // Featuring the president or group photo
                width: 800,
                height: 600,
                alt: "IGAC Team",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "The Team | IGAC Leadership",
        description: "Meet the dedicated team behind IGAC.",
        images: ["/governing-panel/president.jpg"],
    },
};

export default function Page() {
    return <TeamPage />;
}
