import type { Metadata } from "next";
import ScheduleClient from "./ScheduleClient";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
    title: "Schedule",
    description: "Plan your weekend with the full itinerary of Imperial MUN II. Two days of high-velocity diplomacy and prestigious networking.",
    openGraph: {
        title: "Schedule | Imperial MUN Session II",
        description: "Explore the schedule of Imperial MUN II.",
    },
};

export default async function SchedulePage() {
    const settings = await getSiteSettings();
    return <ScheduleClient settings={settings} />;
}