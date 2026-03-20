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
  title: {
    template: "%s | Ndzuma",
    default: "Ndzuma Malate",
  },
  description: "Personal website project scaffold",
  icons: {
    icon: [
      { url: "/assets/favicons/favicon.ico" },
      { url: "/assets/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/favicons/apple-touch-icon.png",
  },
  manifest: "/assets/favicons/site.webmanifest",
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
