/**
 *  NUCLEAR DATA GOLD & TRACKING (2026)
 * 
 * Beheert de centrale lead-scoring, marketing attributie en GA4 events.
 * Vervangt de PHP VoicesDataStandardizer en GA4 Direct Tracking.
 */

export type LeadVibe = 'cold' | 'warm' | 'hot' | 'burning';

export interface LeadContext {
  email: string;
  firstName?: string;
  lastName?: string;
  sourceType: string;
  utmData?: Record<string, string>;
  pageUrl: string;
  isBusiness: boolean;
}

/**
 *  CALCULATE LEAD SCORE
 * Vertaalt user-gedrag naar een atomaire score (0-100).
 */
export function calculateCoreLeadScore(context: LeadContext, visitCount: number = 1): { score: number, vibe: LeadVibe } {
  let score = 0;
  
  // Bron-gebaseerde score
  const sourceScores: Record<string, number> = {
    'demo_request': 40,
    'checkout': 50,
    'contact': 15,
    'voicy': 20
  };
  
  score += sourceScores[context.sourceType] || 10;
  
  // Wederkerende bezoeker bonus
  score += Math.min(20, visitCount * 5);
  
  // Business bonus
  if (context.isBusiness) score += 20;
  
  // Vibe bepalen
  let vibe: LeadVibe = 'cold';
  if (score >= 80) vibe = 'burning';
  else if (score >= 50) vibe = 'hot';
  else if (score >= 25) vibe = 'warm';
  
  return { score, vibe };
}

/**
 *  GA4 EVENT TRACKER
 * Verstuurt events conform de 2026 privacy-wetten (hashed PII).
 */
export function trackCoreEvent(eventName: string, params: Record<string, any>) {
  if (typeof window === 'undefined' || !(window as any).gtag) return;
  
  (window as any).gtag('event', eventName, {
    ...params,
    send_to: 'ga4',
    nuclear_timestamp: new Date().toISOString()
  });
  
  console.log(` TRACKED: ${eventName}`, params);
}

/**
 *  HASH PII (Privacy First)
 * Slaat gevoelige data alleen gehashed op voor marketing-matching.
 */
export async function hashCorePII(data: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
