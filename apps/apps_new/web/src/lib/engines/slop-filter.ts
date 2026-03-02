/**
 *  VOICEGLOT SLOP FILTER (NUCLEAR 2026)
 * 
 * Doel: Voorkomen dat AI-foutmeldingen of hallucinaties als 
 * legitieme vertalingen in de database belanden.
 * 
 * Voldoet aan het Chris-Protocol: Geen slop, alleen kwaliteit.
 */

export class SlopFilter {
  private static forbiddenPhrases = [
    'tijd nodig om na te denken',
    'probeer je het zo nog eens',
    'voldoende context',
    'meer informatie',
    'langere tekst',
    'niet compleet',
    'accuraat',
    'zou je',
    'het lijkt erop',
    'ik kan je niet helpen',
    'als ai-model',
    'sorry',
    'null',
    'contenteditable',
    'focus:ring-primary/30',
    'outline-none focus:ring-2',
    'i need a bit more time to think',
    'please try again',
    'as an ai model'
  ];

  /**
   * Controleert of een tekst waarschijnlijk een AI-foutmelding is.
   */
  static isSlop(text: string, targetLang: string, sourceText: string): boolean {
    if (!text) return true;
    
    const lowerText = String(text).toLowerCase();

    // 1. Check op bekende AI-foutmelding zinnetjes
    if (this.forbiddenPhrases.some(phrase => lowerText.includes(phrase))) {
      return true;
    }

    // 2. Taal-Mismatch Check (Bob-methode)
    // Als de doeltaal niet Nederlands is, maar de tekst bevat typisch Nederlandse woorden 
    // terwijl de brontekst ook Nederlands was, dan is het waarschijnlijk een AI-antwoord in de verkeerde taal.
    const dutchIndicators = [' het ', ' de ', ' een ', ' is ', ' zijn ', ' met ', ' voor '];
    if (targetLang !== 'nl' && targetLang !== 'nl-be' && targetLang !== 'nl-nl') {
      const hasDutchWords = (dutchIndicators || []).filter(word => lowerText.includes(word)).length >= 2;
      // Als de AI in het Nederlands antwoordt op een vertaalverzoek naar bijv. Frans, is het slop.
      if (hasDutchWords && lowerText !== (sourceText || '').toLowerCase()) {
        return true;
      }
    }

    // 3. Lengte Check (Expansion Slop)
    // Een vertaling is zelden 3x zo lang als het origineel voor korte strings.
    // Bijv: 'Voices' -> 'Voices: Home to exceptional voice talent...' is slop.
    if ((sourceText || '').length < 15 && text.length > 30 && !(sourceText || '').includes('...')) {
      return true;
    }

    if (text.length > (sourceText || '').length * 4 && text.length > 100) {
      return true;
    }

    return false;
  }
}
