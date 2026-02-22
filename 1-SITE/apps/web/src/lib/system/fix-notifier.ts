import { DirectMailService } from '../../services/DirectMailService';
import { MarketManagerServer } from './market-manager-server';
import { MarketDatabaseService } from './market-manager-db';

/**
 *  FIX NOTIFIER (NUCLEAR 2026)
 * 
 * Doel: Johfrah automatisch notificeren per fix met uitleg.
 * Volgt het mandaat voor proactieve communicatie.
 */
export class FixNotifier {
  static async notify(fixId: string, description: string, details: string) {
    try {
      const mailService = DirectMailService.getInstance();
      
      //  CHRIS-PROTOCOL: Haal admin e-mail uit ENV of MarketManager (geen hardcoding)
      const market = await MarketDatabaseService.getCurrentMarketAsync('voices.be');
      const adminEmail = process.env.ADMIN_EMAIL || market?.email || 'johfrah@voices.be';
      
      await mailService.sendMail({
        to: adminEmail,
        from: adminEmail,
        subject: `🛠️ Voices Fix LIVE: ${fixId}`,
        html: `
          <div style="font-family: sans-serif; padding: 40px; background: #f9f9f9; border-radius: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
            <h2 style="letter-spacing: -0.02em; color: #ff4f00; margin-bottom: 24px;">Nuclear Fix Deployed</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;"><strong>Fix:</strong> ${description}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #eee;">
              <p style="font-size: 14px; color: #666; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Details:</p>
              <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0;">${details}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #999; text-align: center;">Gegenereerd door de Voices Engine - Pure Excellence 2026</p>
          </div>
        `
      });
      console.log(`✅ Fix notification sent to Johfrah for: ${fixId}`);
    } catch (e) {
      console.error('❌ Failed to send fix notification:', e);
    }
  }
}
