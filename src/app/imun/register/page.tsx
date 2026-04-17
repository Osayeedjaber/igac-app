import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";
import ImunRegisterClient from "./ImunRegisterClient";

export const metadata: Metadata = {
    title: "Registration",
    description: "Official registration portal for Imperial Model United Nations – Session II. Register as a delegate or observer today.",
    openGraph: {
        title: "Register | Imperial MUN Session II",
        description: "Official registration portal for Imperial Model United Nations – Session II.",
    },
};

export default async function ImunRegisterPage() {
    const settings = await getSiteSettings();
    return <ImunRegisterClient settings={settings} />;
}