import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Supreme Suite — White-label CRMs & websites for any business | J Supreme Tech",
    template: "%s — Supreme Suite",
  },
  description:
    "Ready-made, fully-branded CRMs and websites for couriers, movers, beauty pros, tour operators and appointment-based businesses. Upload your logo, pick your colors, launch in minutes. 3-day free trial.",
  metadataBase: new URL("https://suite.jsupremetech.online"),
  openGraph: {
    title: "Supreme Suite by J Supreme Tech",
    description:
      "One engine, every industry. Branded CRM + website templates with a 3-day free trial.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/icons/icon-192.png", sizes: "192x192" },
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
      style={
        {
          // Map next/font CSS vars onto our token names
          "--font-sans": "var(--font-inter)",
          "--font-display": "var(--font-space)",
          "--font-mono": "var(--font-jetbrains)",
        } as React.CSSProperties
      }
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
