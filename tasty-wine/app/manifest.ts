import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tasty Wine Cellar",
    short_name: "Tasty Wine",
    description:
      "Discover curated wines, manage your cellar, and sell effortlessly through the Tasty Wine progressive web app.",
    start_url: "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#180303",
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
