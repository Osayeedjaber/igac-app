import type { Metadata } from "next";
import JoinPage from "./JoinClient";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
    title: "Join Us | IGAC",
    description: "Become a part of the International Global Affairs Council. Join as a Campus Ambassador, Executive Board member, or specialized team member.",
    openGraph: {
        title: "Join Us | IGAC",
        description: "Become a part of the International Global Affairs Council and shape the future of diplomacy.",
        url: "https://igac.info/join",
        siteName: "IGAC",
        images: [
            {
                url: "/logo.png",
                width: 800,
                height: 600,
                alt: "Join IGAC",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Join Us | IGAC",
        description: "Become a part of the International Global Affairs Council.",
        images: ["/logo.png"],
    },
};

export const revalidate = 60;

export default async function Page() {
    const settings = await getSiteSettings();
    return <JoinPage recruitmentOpen={settings.recruitment_open} joinFormUrl={settings.join_form_url} />;
}
