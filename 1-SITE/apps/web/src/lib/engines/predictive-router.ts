/**
 * NUCLEAR PREDICTIVE ROUTER - 2026 EDITION
 * 
 * Deze service vervangt de PHP Predictive Router logica.
 * Het anticipeert op intentie (UTM, Parameters, DNA) en stuurt de 
 * Core-laag aan voor intelligente navigatie en personalisatie.
 */

export interface IntentContext {
  journey: 'agency' | 'studio' | 'academy' | 'commerce';
  intent: string;
  reason: string;
  greeting?: string;
}

import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

export class PredictiveRouter {
  private static CAMPAIGN_MAP: Record<string, string> = {
    'telephony_promo': 'vlaamse-voicemail-stemmen',
    'commercial_2026': 'vlaamse-voice-overs-commercials',
    'elearning_expert': 'vlaamse-voice-overs-e-learning',
    'workshop_intake': 'workshop'
  };

  private static KEYWORD_MAP: Record<string, string> = {
    'voicemail': 'vlaamse-voicemail-stemmen',
    'ivr': 'vlaamse-voicemail-stemmen',
    'commercial': 'vlaamse-voice-overs-commercials',
    'reclame': 'vlaamse-voice-overs-commercials',
    'learning': 'vlaamse-voice-overs-e-learning',
    'bedrijfsvideo': 'vlaamse-voice-overs-e-learning'
  };

  private static ARTICLE_MAP: Record<string, string> = {
    'prijs': 'hoeveel-kost-een-voice-over',
    'kosten': 'hoeveel-kost-een-voice-over',
    'tarieven': 'hoeveel-kost-een-voice-over',
    'retentie': 'video-retentie-menselijke-stem',
    'waarom': 'waarom-laten-inspreken',
    'zakelijk': 'zakelijke-voicemail-inspreken',
    'voicemail-tips': 'zakelijke-voicemail-inspreken'
  };

  /**
   * Analyseert de huidige URL en parameters om de intentie te bepalen
   */
  static determineIntent(url: string, searchParams: URLSearchParams): IntentContext | null {
    const utmCampaign = searchParams.get('utm_campaign') || '';
    const utmSource = searchParams.get('utm_source') || '';
    const utmTerm = (searchParams.get('utm_term') || '').toLowerCase();
    const utmContent = (searchParams.get('utm_content') || '').toLowerCase();
    const q = (searchParams.get('q') || '').toLowerCase();

    // 1. Journey Detection
    if (utmCampaign.includes('academy') || utmSource.includes('academy')) {
      return { journey: 'academy', intent: 'learn_skill', reason: 'utm_journey_match' };
    }

    if (utmCampaign.includes('studio') || utmCampaign.includes('workshop') || 
        utmSource.includes('studio') || utmSource.includes('workshop')) {
      return { journey: 'studio', intent: 'management', reason: 'utm_journey_match' };
    }

    // 2. Deep Article Match (High Priority)
    for (const [keyword, articleSlug] of Object.entries(this.ARTICLE_MAP)) {
      if (utmTerm.includes(keyword) || utmContent.includes(keyword) || q.includes(keyword)) {
        return {
          journey: 'agency',
          intent: `article:${articleSlug}`,
          reason: 'deep_article_match',
          greeting: this.getGreeting(`article:${articleSlug}`)
        };
      }
    }

    // 3. Campaign Mapping
    if (this.CAMPAIGN_MAP[utmCampaign]) {
      return { 
        journey: 'agency', 
        intent: this.CAMPAIGN_MAP[utmCampaign], 
        reason: 'utm_campaign_match',
        greeting: this.getGreeting(this.CAMPAIGN_MAP[utmCampaign])
      };
    }

    // 3. Keyword Matching
    for (const [keyword, slug] of Object.entries(this.KEYWORD_MAP)) {
      if (utmTerm.includes(keyword) || utmContent.includes(keyword)) {
        return { 
          journey: 'agency', 
          intent: slug, 
          reason: 'utm_keyword_match',
          greeting: this.getGreeting(slug)
        };
      }
    }

    return null;
  }

  /**
   * Genereert een gepersonaliseerde begroeting voor Voicy
   */
  private static getGreeting(intentSlug: string): string {
    const greetings: Record<string, string> = {
      'vlaamse-voicemail-stemmen': "Hoi! Ik heb onze beste Vlaamse stemmen voor je voicemail klaargezet. Kan ik je helpen met een script?",
      'vlaamse-voice-overs-commercials': "Welkom! Zoek je een krachtige Vlaamse stem voor je nieuwe campagne? Hier zijn onze top-performers.",
      'vlaamse-voice-overs-e-learning': "Dag! Voor e-learning en corporate video's heb ik deze heldere Vlaamse stemmen voor je geselecteerd.",
      'workshop': "Hoi! Zin om je stem te laten horen? Ik help je graag bij je inschrijving voor de workshop.",
      'academy_intro': "Welkom bij de Academy!  Ik ben je persoonlijke studie-coach. Klaar om je volgende les te starten?",
      'academy_feedback': "Hoi! Johfrah heeft feedback achtergelaten op je laatste inzending. Wil je het bekijken?",
      'academy_cert_ready': "Gefeliciteerd!  Je hebt alle lessen voltooid. Je certificaat staat klaar voor download!",
      'article:hoeveel-kost-een-voice-over': "Hoi! Ik zie dat je benieuwd bent naar de tarieven. Ik heb hier een handig overzicht voor je.",
      'article:video-retentie-menselijke-stem': "Welkom! Wist je dat een menselijke stem de retentie van je video met 40% verhoogt? Ik vertel je er graag meer over.",
      'article:waarom-laten-inspreken': "Dag! Benieuwd naar de meerwaarde van een professionele stem? Ik heb de belangrijkste redenen voor je op een rij gezet.",
      'article:zakelijke-voicemail-inspreken': "Hoi! Een professionele voicemail is je digitale visitekaartje. Zal ik je helpen met een sterk script?"
    };

    return greetings[intentSlug] || "Welkom terug! Hoe kan ik je vandaag helpen?";
  }

  /**
   * Voert intelligente routing uit op basis van user role (Beheer-modus)
   */
  static getAutoRoute(user: { roles: string[], subroles?: string[], email: string }): string | null {
    const subroles = user.subroles || [];
    const adminEmail = process.env.ADMIN_EMAIL;
    if (subroles.includes('academy_student') || user.roles.includes('academy_student')) return '/academy';
    if (subroles.includes('studio_instructor') || subroles.includes('studio_workshopgever') || user.roles.includes('workshop_partner') || user.email === 'bernadette@voices.be' || (adminEmail && user.email === adminEmail)) return '/studio';
    return null;
  }
}
