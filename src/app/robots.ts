import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/portal/scan"],
      },
    ],
    sitemap: "https://igac.info/sitemap.xml",
    host: "https://igac.info",
  };
}
