import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://revistagestao.com.br";

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
