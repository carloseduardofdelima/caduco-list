import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PS2 Games Archive | PlayStation 2",
    short_name: "PS2 Archive",
    description: "Catálogo pessoal e registro de jogos de PlayStation 2 jogados e planejados.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090e",
    theme_color: "#00439c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
