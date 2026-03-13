import {
  Building2,
  Globe,
  Mic2,
  Monitor,
  Phone,
  Radio,
  type LucideIcon,
} from "lucide-react";

export type AgencyCategoryLink = {
  label: string;
  href: string;
  key: string;
  icon: LucideIcon;
};

export const AGENCY_CATEGORY_LINKS: readonly AgencyCategoryLink[] = [
  { label: "TV Spot", icon: Monitor, href: "/stem/tv", key: "category.tv" },
  { label: "Radio", icon: Radio, href: "/stem/radio", key: "category.radio" },
  { label: "Online", icon: Globe, href: "/stem/online", key: "category.online" },
  { label: "Podcast", icon: Mic2, href: "/stem/podcast", key: "category.podcast" },
  { label: "Telefonie", icon: Phone, href: "/stem/telephony", key: "category.telefoon" },
  { label: "Corporate", icon: Building2, href: "/stem/video", key: "category.corporate" },
] as const;
