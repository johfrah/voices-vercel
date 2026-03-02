/**
 *  NUCLEAR TELEGRAM SERVICE (2026)
 *  Zorgt voor directe, onverwoestbare alerts naar de admin.
 * 
 *  CHRIS-PROTOCOL: "Een fout die niemand ziet, is een tijdbom."
 */

export class TelegramService {
  private static readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private static readonly ADMIN_IDS = (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').filter(Boolean);

  /**
   * Stuurt een alert naar alle geautoriseerde admins met rate-limiting
   */
  static async sendAlert(message: string, options: { parse_mode?: 'HTML' | 'MarkdownV2'; force?: boolean } = {}) {
    // 🛡️ CHRIS-PROTOCOL: Telegram alerts zijn TIJDELIJK UITGESCHAKELD op verzoek van de gebruiker (teveel foutmeldingen).
    // Om weer in te schakelen, verwijder de onderstaande return.
    return;

    if (!this.BOT_TOKEN || this.ADMIN_IDS.length === 0) {
      console.warn('[TelegramService] Bot token or Admin IDs missing, skipping alert.');
      return;
    }

    // 🛡️ CHRIS-PROTOCOL: Rate limiting om "Nuclear Alert Fatigue" te voorkomen
    // We laten maximaal 1 bericht per 30 seconden door, tenzij 'force' is true.
    if (!options.force) {
      const now = Date.now();
      const lastSent = (global as any)._lastTelegramAlertSent || 0;
      if (now - lastSent < 30000) {
        console.log('[TelegramService] 🤫 Rate-limited. Alert suppressed to prevent spam.');
        return;
      }
      (global as any)._lastTelegramAlertSent = now;
    }

    console.log(`[TelegramService] Sending alert to ${this.ADMIN_IDS.length} admins: ${message.substring(0, 50)}...`);

    const promises = this.ADMIN_IDS.map(chatId => 
      fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: options.parse_mode || 'HTML',
          disable_web_page_preview: true
        })
      }).then(async res => {
        if (!res.ok) {
          const errData = await res.json();
          console.error(`[TelegramService] Telegram API Error for ${chatId}:`, errData);
        } else {
          console.log(`[TelegramService] Successfully sent alert to ${chatId}`);
        }
      }).catch(err => console.error(`[TelegramService] Fetch failed for ${chatId}:`, err))
    );

    await Promise.all(promises);
  }

  /**
   * Formatteert een kritieke systeemfout voor Telegram
   */
  static async reportCriticalError(options: {
    error: string;
    component: string;
    url?: string;
    payload?: any;
    stack?: string;
  }) {
    const emoji = '🚨';
    const title = `<b>${emoji} NUCLEAR ALERT: ${options.component}</b>`;
    const errorMsg = `<code>${options.error.substring(0, 200)}</code>`;
    const urlMsg = options.url ? `\n\n<b>URL:</b> ${options.url}` : '';
    
    let payloadMsg = '';
    if (options.payload) {
      const json = JSON.stringify(options.payload, null, 2);
      payloadMsg = `\n\n<b>PAYLOAD:</b>\n<code>${json.substring(0, 500)}${json.length > 500 ? '...' : ''}</code>`;
    }

    const message = `${title}\n\n${errorMsg}${urlMsg}${payloadMsg}\n\n<i>-- Chris / Autist</i>\n\n<code>💡 Deze fout is gelogd in de Watchdog en ik ben al op zoek naar een fix.</code>`;
    
    await this.sendAlert(message);
  }
}
