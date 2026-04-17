import type { Metadata } from "next";
import SecretariatClient from "./SecretariatClient";

export const metadata: Metadata = {
    title: "Secretariat",
    description: "Meet the executive board and the governing secretariat of Imperial Model United Nations – Session II. These are the leaders shaping the conference.",
    openGraph: {
        title: "Secretariat | Imperial MUN Session II",
        description: "The leadership team behind Imperial MUN Session II.",
    },
};

export default function SecretariatPage() {
    return <SecretariatClient />;
}