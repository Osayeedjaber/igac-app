import type { Metadata } from "next";
import EventsPage from "./EventsClient";
import { getEvents, getSiteStats } from "@/lib/data";

export const metadata: Metadata = {
    title: "Our Legacy | IGAC Events",
    description: "Explore the archive of International Global Affairs Council's past and upcoming conferences. From IGACMUN to regional symposiums, discover our impact.",
    openGraph: {
        title: "Our Legacy | IGAC Events",
        description: "Explore the archive of International Global Affairs Council's past and upcoming conferences.",
        url: "https://igac.info/events",
        siteName: "IGAC",
        images: [
            {
                url: "/past-events/igacmuns2bannerjpg.jpg", // Use a featured event image
                width: 1200,
                height: 630,
                alt: "IGAC Events",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Our Legacy | IGAC Events",
        description: "Explore the archive of International Global Affairs Council's past and upcoming conferences.",
        images: ["/past-events/igacmuns2bannerjpg.jpg"],
    },
};

export const revalidate = 60;

export default async function Page() {
    const [events, siteStats] = await Promise.all([
        getEvents(),
        getSiteStats(),
    ]);
    return <EventsPage events={events} stats={siteStats} />;
}
