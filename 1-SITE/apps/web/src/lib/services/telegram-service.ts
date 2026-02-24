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
   * Stuurt een alert naar alle geautoriseerde admins
   */
  static async sendAlert(message: string, options: { parse_mode?: 'HTML' | 'MarkdownV2' } = {}) {
    if (!this.BOT_TOKEN || this.ADMIN_IDS.length === 0) {
      console.warn('[TelegramService] Bot token or Admin IDs missing, skipping alert.');
      return;
    }

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
      }).catch(err => console.error(`[TelegramService] Failed to send to ${chatId}:`, err))
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

    const message = `${title}\n\n${errorMsg}${urlMsg}${payloadMsg}\n\n<i>-- Chris / Autist</i>`;
    
    await this.sendAlert(message);
  }
}
