import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
    title: "Register | IGAC",
    description: "Register for the IGAC Model United Nations Conference.",
};

export const revalidate = 60;

export default async function RegisterPage() {
    const settings = await getSiteSettings();
    return <RegisterClient registrationOpen={settings.registration_open} registerUrl={settings.register_url} />;
}
