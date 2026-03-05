import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/admin-login",
    name: "Voices Admin Mobile",
    short_name: "Voices Admin",
    description: "Mobile-first admin toegang voor orders, login en opvolging.",
    start_url: "/admin-login",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf8f5",
    theme_color: "#101015",
    lang: "nl-BE",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Mobiel dashboard",
        short_name: "Dashboard",
        url: "/admin/mobile",
      },
      {
        name: "Orders",
        short_name: "Orders",
        url: "/admin/orders",
      },
      {
        name: "Mailbox",
        short_name: "Mailbox",
        url: "/admin/mailbox",
      },
    ],
  };
}
