import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import { api } from "../lib/api";

import "./globals.css";
import SiteShell from "../components/site-shell";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ndzumamalate.com"),
  title: {
    template: "%s | Ndzuma Malate",
    default: "Ndzuma Malate",
  },
  description: "Software Engineer crafting thoughtful, performant, and scalable digital experiences.",
  authors: [{ name: "Ndzuma Malate", url: "https://ndzumamalate.com" }],
  creator: "Ndzuma Malate",
  publisher: "Ndzuma Malate",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/assets/favicons/favicon.ico" },
      { url: "/assets/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/favicons/apple-touch-icon.png",
  },
  manifest: "/assets/favicons/site.webmanifest",
  openGraph: {
    title: "Ndzuma Malate",
    description: "Software Engineer crafting thoughtful, performant, and scalable digital experiences.",
    url: "https://ndzumamalate.com",
    siteName: "Ndzuma Malate",
    images: [
      {
        url: "/assets/banner.png",
        width: 1200,
        height: 630,
        alt: "Ndzuma Malate - Software Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ndzuma Malate",
    description: "Software Engineer crafting thoughtful, performant, and scalable digital experiences.",
    creator: "@ndzumamalate",
    images: ["/assets/banner.png"],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  // If no blogs, we can hide the Blog navigation link
  let hasBlogs = false;
  try {
    const blogs = await api.getBlogs();
    hasBlogs = blogs && blogs.length > 0;
  } catch (error) {
    console.error("Failed to fetch blogs for nav:", error);
  }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={geist.variable}>
        <SiteShell hasBlogs={hasBlogs}>{children}</SiteShell>
      </body>
    </html>
  );
}
