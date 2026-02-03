import type { Metadata } from "next";
import ContactPage from "./ContactClient";

export const metadata: Metadata = {
    title: "Contact Us | IGAC",
    description: "Get in touch with the International Global Affairs Council. Have questions? Reach out to us for inquiries about the conference, partnerships, or delegate affairs.",
    openGraph: {
        title: "Contact Us | IGAC",
        description: "Get in touch with the International Global Affairs Council. We are here to help.",
        url: "https://igac.org/contact",
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
        title: "Contact Us | IGAC",
        description: "Get in touch with the International Global Affairs Council.",
        images: ["/logo.png"],
    },
};

export default function Page() {
    return <ContactPage />;
}
