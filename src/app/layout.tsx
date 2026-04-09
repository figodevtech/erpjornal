import type { Metadata } from "next";
import { Newsreader, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Revista Gestão - Liderança e Informação",
  description: "Portal moderno de notícias focado em gestão governamental, estratégia e política interativa.",
  openGraph: {
    title: "Revista Gestão",
    siteName: "Revista Gestão",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${newsreader.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <NextTopLoader
            color="#dc2626"
            crawlSpeed={180}
            height={3}
            easing="ease"
            showSpinner={false}
            shadow="0 0 14px rgba(220, 38, 38, 0.45)"
            zIndex={10000}
          />
          {children}
          <Toaster position="top-right" richColors />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}

