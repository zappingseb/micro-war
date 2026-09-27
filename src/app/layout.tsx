import type { Metadata } from "next";
import { Barlow_Condensed, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { RevealObserver } from "@/components/RevealObserver";

/*
 * Three faces, per PLAN.md §5.2: a heavy condensed grotesque for display,
 * a clean grotesk for UI, and a monospace for data and accessions.
 * The CSS variables feed the tokens in globals.css.
 */
const display = Barlow_Condensed({
  variable: "--font-display",
  weight: ["700", "800"],
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  // Full deploy URL, so OG/Twitter tags emit absolute URLs a scraper can resolve.
  metadataBase: new URL(`https://engel-wolf.com${basePath}/`),
  title: {
    default: "MicroWar — the open league for antimicrobial and bioproduction discovery",
    template: "%s · MicroWar",
  },
  description:
    "A competitive benchmarking arena for microbiology labs. Submit strains and media, get scored on automated plate imaging, and collect the cards.",
  openGraph: {
    title: "MicroWar",
    description: "The open league for antimicrobial and bioproduction discovery.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
