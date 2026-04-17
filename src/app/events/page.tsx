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

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "IGAC - International Global Affairs Council Conferences",
        "description": "The archives of prestigious Model UN conferences and regional events hosted by IGAC.",
        "itemListElement": events.map((event, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Event",
                "name": event.title,
                "description": event.description,
                "image": event.image,
                "location": {
                    "@type": "Place",
                    "name": event.location
                },
                "organizer": {
                    "@type": "Organization",
                    "name": "International Global Affairs Council"
                }
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <EventsPage events={events} stats={siteStats} />;
        </>
    );
}
