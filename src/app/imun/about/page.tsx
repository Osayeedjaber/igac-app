import type { Metadata } from "next";
import AboutImunClient from "./AboutImunClient";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
    title: "About",
    description: "Learn about the legacy, vision, and prestige behind Imperial MUN Session II. We are architecting the next era of global leadership.",
    openGraph: {
        title: "About | Imperial MUN Session II",
        description: "The legacy, vision, and prestige behind Imperial MUN Session II.",
    },
};

export default async function AboutImunPage() {
    const settings = await getSiteSettings();
    return <AboutImunClient settings={settings} />;
}
