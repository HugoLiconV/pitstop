import type { Metadata, Viewport } from "next";
import { Geist, Barlow_Semi_Condensed, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import splashScreens from "@/lib/brand/splash-screens.json";

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
  applicationName: "Pitstop",
  // iOS ignores the manifest's splash; it needs one startup image per screen size, matched by media query.
  appleWebApp: {
    capable: true,
    title: "Pitstop",
    statusBarStyle: "default",
    startupImage: splashScreens.map(({ width, height, deviceWidth, deviceHeight, ratio }) => ({
      url: `/splash/apple-splash-${width}x${height}.png`,
      media: `screen and (device-width: ${deviceWidth}px) and (device-height: ${deviceHeight}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
    })),
  },
  // Next emits only the standard tag; older iOS needs Apple's own before it uses the startup images.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#e7e5e0",
  viewportFit: "cover",
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
