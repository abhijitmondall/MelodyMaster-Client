import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "MelodyMasters", template: "%s | MelodyMasters" },
  description: "Unlock your musical potential with MelodyMasters — world-class instructors, expert curriculum, and a thriving community.",
  keywords: ["music school", "music classes", "guitar", "piano", "vocal training", "MelodyMasters"],
  openGraph: {
    title: "MelodyMasters",
    description: "Discover and enroll in world-class music courses.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        suppressHydrationWarning on <body> prevents false hydration errors
        caused by browser extensions (e.g. Grammarly, LastPass) that inject
        attributes like `cz-shortcut-listen` or `data-gr-ext-installed` into
        the DOM before React hydrates.
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
