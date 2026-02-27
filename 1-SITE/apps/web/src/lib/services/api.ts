import { 
  Actor, 
  Demo, 
  SearchResults, 
  SearchFilters, 
  StudioDashboardData, 
  AcademyDashboardData, 
  Workshop, 
  WorkshopStats, 
  Participant,
  Lesson
} from "../types";

export type { 
  Actor, 
  Demo, 
  SearchResults, 
  SearchFilters, 
  StudioDashboardData, 
  AcademyDashboardData, 
  Workshop, 
  WorkshopStats, 
  Participant,
  Lesson
};

/**
 *  CLIENT-SAFE API (2026)
 * 
 * Bevat alleen functies die veilig in de browser kunnen draaien.
 * Database-interacties zijn verplaatst naar api-server.ts.
 */

export async function getActor(slug: string, lang: string = 'nl-BE'): Promise<Actor> {
  const res = await fetch(`/api/admin/config?type=actor&slug=${slug}&lang=${lang}`);
  if (!res.ok) throw new Error("Actor not found");
  return res.json();
}

export async function getActors(params: Record<string, string> = {}, lang: string = 'nl-BE'): Promise<SearchResults> {
  const res = await fetch(`/api/admin/config?type=actors&lang=${lang}&${new URLSearchParams(params).toString()}`);
  if (!res.ok) return { count: 0, results: [], filters: { genders: [], languages: [], styles: [] } };
  return res.json();
}

export async function getMusicLibrary(category: string = 'music'): Promise<any[]> {
  const res = await fetch(`/api/admin/config?type=music&category=${category}`);
  if (!res.ok) return [];
  return res.json();
}

/**
 *  CONTENT MODERATION: Controleert tekst op verboden content voor AI-generatie
 */
export async function validateAiText(text: string): Promise<{ allowed: boolean; reason?: string }> {
  const forbiddenKeywords = [
    'trivago', 'bmw', 'coca-cola', 'radio 1', 'radio 2', 'q-music', 'joe fm',
    'verkiezingsprogramma', 'politiek', 'stem op', 'casino', 'gokken', '18+',
    'seks', 'porno', 'haat', 'racisme'
  ];

  const lowerText = text.toLowerCase();
  for (const word of forbiddenKeywords) {
    if (lowerText.includes(word)) {
      return { allowed: false, reason: `Verboden categorie (${word}).` };
    }
  }

  return { allowed: true };
}
