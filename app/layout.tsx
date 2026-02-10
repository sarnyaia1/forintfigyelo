import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havikiadas.hu";

export const metadata: Metadata = {
  title: {
    default: "HaviKiadas - Ingyenes havi költségkezelő alkalmazás",
    template: "%s | HaviKiadas",
  },
  description:
    "Kövesd nyomon a havi bevételeidet és kiadásaidat, tervezz költségkeretet kategóriánként, és hozz tudatos pénzügyi döntéseket. Ingyenes, magyar nyelvű költségkezelő.",
  keywords: [
    "költségkezelő",
    "havi kiadások",
    "havi bevételek",
    "pénzügyi tervező",
    "budget",
    "költségvetés",
    "pénzügyek kezelése",
    "magyar költségkezelő",
    "ingyenes költségkezelő",
  ],
  authors: [{ name: "HaviKiadas" }],
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: siteUrl,
    siteName: "HaviKiadas",
    title: "HaviKiadas - Ingyenes havi költségkezelő alkalmazás",
    description:
      "Kövesd nyomon a havi bevételeidet és kiadásaidat, tervezz költségkeretet, és hozz tudatos pénzügyi döntéseket. Ingyenes, magyar nyelvű.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HaviKiadas - Ingyenes havi költségkezelő alkalmazás",
    description:
      "Kövesd nyomon a havi bevételeidet és kiadásaidat, tervezz költségkeretet, és hozz tudatos pénzügyi döntéseket.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "HaviKiadas",
    url: siteUrl,
    description:
      "Ingyenes magyar nyelvű havi költségkezelő alkalmazás. Kövesd nyomon bevételeidet és kiadásaidat, tervezz költségkeretet.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "HUF",
    },
    inLanguage: "hu",
  };

  return (
    <html lang="hu">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
