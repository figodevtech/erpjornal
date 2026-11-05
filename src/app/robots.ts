import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",     // Blinda apis json dos raspadores
        "/erp/",     // Oculta completamente a camada ERP de indexação
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
