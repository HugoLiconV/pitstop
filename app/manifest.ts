import type { MetadataRoute } from "next";

// Installable as a home-screen app. Android builds its splash from background_color, name and the 512 icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pitstop",
    short_name: "Pitstop",
    description: "Mantenimiento de mi Mazda 6",
    lang: "es-MX",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e7e5e0",
    theme_color: "#e7e5e0",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
