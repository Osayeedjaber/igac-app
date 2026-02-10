import { AboutClient } from "./AboutClient";
import { Metadata } from "next";
import { getTeamMembers } from "@/lib/data";

export const metadata: Metadata = {
    title: "About IGAC | Forging the Diplomats of Tomorrow",
    description: "Learn more about the International Global Affairs Council (IGAC), our mission, vision, and the journey of South East Asia's premier Model United Nations organization.",
    openGraph: {
        title: "About IGAC | Forging the Diplomats of Tomorrow",
        description: "Discover our mission to empower youth through diplomacy and leadership.",
        url: "https://igac.info/about",
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

export const revalidate = 60;

export default async function AboutPage() {
    const teamData = await getTeamMembers();
    const ctgHead = teamData.ctgHead ? {
        name: teamData.ctgHead.name,
        role: teamData.ctgHead.role,
        image: teamData.ctgHead.image,
        socials: teamData.ctgHead.socials,
    } : undefined;

    const president = teamData.governingBody[0] ? {
        name: teamData.governingBody[0].name,
        role: teamData.governingBody[0].role,
        image: teamData.governingBody[0].image,
        quote: teamData.governingBody[0].quote || "",
        socials: teamData.governingBody[0].socials,
    } : undefined;

    return (
        <main className="min-h-screen pt-24 pb-20 bg-background font-sans selection:bg-primary/30 relative">
            <AboutClient ctgHead={ctgHead} president={president} />
        </main>
    );
}
