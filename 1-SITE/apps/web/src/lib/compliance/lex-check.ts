/**
 *  LEX: COMPLIANCE & VERACITY CHECKER (2026)
 * 
 * Verantwoordelijk voor het bewaken van de waarheid en integriteit op de site.
 * Lex controleert prijzen, BTW-logica en juridische consistentie.
 * 
 * MANDAAT: "Niet blokkeren, wel rapporteren."
 * Als Lex een inconsistentie vindt, laat hij de gebruiker doorgaan (om conversie niet te schaden),
 * maar stuurt hij direct een 'Forensisch Rapport' naar de admin.
 */

export interface LexCheckResult {
  isConsistent: boolean;
  issues: string[];
}

export class LexCheck {
  /**
   * Voert een volledige integriteitscheck uit op een order/formulier.
   */
  static async auditOrder(data: any): Promise<LexCheckResult> {
    const issues: string[] = [];

    // 1. Prijs-consistentie check (Backend vs Frontend)
    if (data.pricing && data.pricingResult) {
      const diff = Math.abs(data.pricing.total - data.pricingResult.total);
      if (diff > 0.01) {
        issues.push(`Prijs-inconsistentie gedetecteerd: Frontend gaf ${data.pricing.total}, maar Backend berekende ${data.pricingResult.total}.`);
      }
    }

    // 2. BTW-logica check
    if (data.country === 'BE' && data.isVatExempt) {
      issues.push(`Verdachte BTW-vrijstelling: Gebruiker uit Belgi claimt BTW-vrijstelling.`);
    }

    // 3. Facturatie-integriteit
    if (data.gateway === 'banktransfer' && !data.company) {
      issues.push(`Facturatie-risico: Betaling via overschrijving gekozen zonder bedrijfsnaam.`);
    }

    const isConsistent = issues.length === 0;

    if (!isConsistent) {
      await this.notifyAdmin(issues, data);
    }

    return {
      isConsistent,
      issues
    };
  }

  /**
   * Stuurt een notificatie naar de admin (via Telegram of interne logs).
   */
  private static async notifyAdmin(issues: string[], context: any) {
    console.warn(` LEX ALERT: ${issues.join(' | ')}`);
    
    const message = ` *LEX ALERT: Inconsistentie Gevonden*\n\n` +
      `*Issues:*\n${issues.map(i => ` ${i}`).join('\n')}\n\n` +
      `*Context:*\n` +
      ` Gebruiker: ${context.email || 'Onbekend'}\n` +
      ` Order ID: ${context.orderId || 'N/A'}\n` +
      ` Bedrag: ${context.pricing?.total || '?'}\n\n` +
      `_De gebruiker is niet tegengehouden (Bob-methode: Conversie Eerst)._`;

    try {
      // Gebruik de bestaande Telegram integratie als die er is
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ALLOWED_USER_IDS) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_ALLOWED_USER_IDS.split(',')[0];
        
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          })
        });
      }
    } catch (e) {
      console.error(' LEX: Failed to notify admin via Telegram:', e);
    }
  }
}
