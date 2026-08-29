import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { RouteTransitionOverlay } from "@/components/loading/route-transition-overlay";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("dsa-mentor-ai-theme");
    const theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
    const resolvedTheme = theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : theme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch {
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "DSA Mentor AI",
    template: "%s | DSA Mentor AI",
  },
  description: "AI-powered DSA learning platform with lessons, RAG, visualizations, practice, and learning intelligence.",
  applicationName: "DSA Mentor AI",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
      { url: "/icons/icon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg?v=2",
    apple: "/icons/apple-touch-icon.png?v=3",
  },
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Suspense fallback={null}>
            <RouteTransitionOverlay />
          </Suspense>
          <ServiceWorkerRegistration />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
