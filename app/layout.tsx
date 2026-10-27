import type { Metadata } from "next";
import { Geist, Barlow_Semi_Condensed, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const barlow = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowFigures = Barlow_Semi_Condensed({
  variable: "--font-figures",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Logbook voice for the home: a reading serif for answers, a mono for labels and figures.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Pitstop",
  description: "Mantenimiento de mi Mazda 6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${barlow.variable} ${barlowFigures.variable} ${newsreader.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
