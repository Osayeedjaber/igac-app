import type { Metadata } from "next";
import CTGRegionPage from "./CTGClient";
import { getTeamMembers } from "@/lib/data";

export const metadata: Metadata = {
    title: "IGAC Chattogram | Regional Division",
    description: "The official regional division of IGAC in Chattogram. Empowering youth in the port city with diplomatic skills and leadership opportunities.",
    openGraph: {
        title: "IGAC Chattogram | Regional Division",
        description: "The official regional division of IGAC in Chattogram.",
        url: "https://igac.info/regions/ctg",
        siteName: "IGAC",
        images: [
            {
                url: "/ctghead.jpg", // Assuming this exists or falls back to logo
                width: 800,
                height: 600,
                alt: "IGAC Chattogram",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "IGAC Chattogram | Regional Division",
        description: "The official regional division of IGAC in Chattogram.",
        images: ["/ctghead.jpg"],
    },
};

export const revalidate = 60;

export default async function Page() {
    const teamData = await getTeamMembers();
    
    // Ensure we have fallback data for CTG
    const ctgData = {
        head: teamData.ctgHead,
        corePanel: teamData.ctgCore || [],
        heads: teamData.ctgHeads || [],
        deputies: teamData.ctgDeputies || [],
        executives: teamData.ctgExecutives || [],
    };
    
    return <CTGRegionPage ctgData={ctgData} />;
}
