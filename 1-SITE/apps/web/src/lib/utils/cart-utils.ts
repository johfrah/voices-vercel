import { Actor } from '@/types';

/**
 * CHRIS-PROTOCOL: Cart Hashing Utility
 * 
 * Genereert een stabiele hash van de mandje-configuratie.
 * Wordt gebruikt om race-conditions te detecteren tussen de frontend en backend.
 */
export function generateCartHash(items: any[], selectedActor: Actor | null, step: string): string {
  // We hashen alleen de relevante prijs-bepalende factoren
  const config = {
    step,
    items: items.map(item => ({
      id: item.id,
      actorId: item.actor?.id,
      usage: item.usage,
      media: item.media,
      country: item.country,
      spots: item.spots,
      years: item.years,
      words: item.briefing?.trim().split(/\s+/).filter(Boolean).length || 0,
      music: item.music?.trackId,
      liveSession: item.liveSession
    })),
    currentSelection: selectedActor ? {
      actorId: selectedActor.id,
      // Andere factoren worden uit de context gehaald tijdens berekening
    } : null
  };

  // Simpele stringify als hash (voldoende voor vergelijking)
  return Buffer.from(JSON.stringify(config)).toString('base64').slice(0, 32);
}
