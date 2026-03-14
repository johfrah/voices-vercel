export type GlobalNavJourneyKey =
  | "agency"
  | "studio"
  | "academy"
  | "ademing"
  | "portfolio"
  | "artist"
  | "johfrai"
  | "freelance"
  | "partner";

const WORLD_ID_TO_JOURNEY: Record<number, GlobalNavJourneyKey> = {
  2: "studio",
  3: "academy",
  5: "portfolio",
  6: "ademing",
  7: "freelance",
  8: "partner",
  10: "johfrai",
  25: "artist",
};

export function resolveGlobalNavJourneyKey(
  worldId: number | null | undefined,
  pathname: string | null | undefined
): GlobalNavJourneyKey {
  if (worldId !== null && worldId !== undefined) {
    const journeyFromWorld = WORLD_ID_TO_JOURNEY[worldId];
    if (journeyFromWorld) return journeyFromWorld;
  }

  const safePathname = pathname || "";

  if (safePathname.startsWith("/studio") || safePathname.includes("/studio")) return "studio";
  if (safePathname.startsWith("/academy") || safePathname.includes("/academy")) return "academy";
  if (safePathname.startsWith("/ademing")) return "ademing";
  if (safePathname.startsWith("/johfrai")) return "johfrai";
  if (safePathname.startsWith("/freelance")) return "freelance";
  if (safePathname.startsWith("/partner")) return "partner";

  return "agency";
}
