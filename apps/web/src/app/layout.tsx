import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "DSA Mentor AI",
    template: "%s | DSA Mentor AI",
  },
  description: "AI-powered DSA learning platform with lessons, RAG, visualizations, practice, and learning intelligence.",
  applicationName: "DSA Mentor AI",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DSA Mentor AI",
    description: "AI-powered DSA learning platform.",
    url: "/",
    siteName: "DSA Mentor AI",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DSA Mentor AI",
    description: "AI-powered DSA learning platform.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
