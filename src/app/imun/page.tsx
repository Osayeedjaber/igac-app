import type { Metadata } from "next";
import ImunMainClient from "./ImunMainClient";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
    title: {
        template: "%s | Imperial MUN II",
        default: "Imperial Model United Nations - SESSION II | IGAC",
    },
    description: "Join South East Asia's most prestigious diplomatic forum. Imperial Model United Nations (IMUN) Session II offers high-stakes debate and leadership training.",
    keywords: ["IMUN", "Imperial MUN", "Model United Nations", "Diplomacy", "IGAC", "MUN SESSION II", "Youth Leadership"],
    openGraph: {
        title: "Imperial Model United Nations - SESSION II",
        description: "Join South East Asia's most prestigious diplomatic forum. High-stakes debate, strategic negotiation, and leadership training.",
        url: "https://igac.info/imun",
        siteName: "IGAC - Imperial MUN",
        images: [
            {
                url: "/Imun/Logo/IMUN%20Logos-01.png",
                width: 1200,
                height: 630,
                alt: "Imperial MUN Session II Logo",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Imperial MUN - SESSION II",
        description: "Join the next era of global leadership at IMUN II.",
        images: ["/Imun/Logo/IMUN%20Logos-01.png"],
    },
};

export default async function ImunPage() {
    const settings = await getSiteSettings();

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Imperial Model United Nations - SESSION II",
            "description": "Join South East Asia's most prestigious diplomatic forum. Imperial Model United Nations (IMUN) Session II offers high-stakes debate and leadership training.",
            "image": "https://igac.info/Imun/Logo/IMUN%20Logos-01.png",
            "location": {
                "@type": "Place",
                "name": "Imperial MUN Conference Center",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Dhaka",
                    "addressCountry": "BD"
                }
            },
            "organizer": {
                "@type": "Organization",
                "name": "IGAC - International Global Affairs Council",
                "url": "https://igac.info"
            },
            "offers": {
                "@type": "Offer",
                "url": "https://igac.info/imun/register",
                "availability": "https://schema.org/InStock"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://igac.info"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Imperial MUN",
                    "item": "https://igac.info/imun"
                }
            ]
        }
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ImunMainClient settings={settings} />
        </>
    );
}