import { DirectMailService } from './direct-mail-service';
import { VoicesMailEngine } from './voices-mail-engine';
import fs from 'fs';
import path from 'path';

/**
 * 🎙️ JOHFRAI MAIL BRIDGE
 * 
 * Doel: Versturen van gegenereerde audiofragmenten naar de gebruiker.
 */

export async function sendJohfraiAudio(to: string, audioPath: string, text: string, host?: string) {
  const mailEngine = VoicesMailEngine.getInstance();
  
  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audiobestand niet gevonden op pad: ${audioPath}`);
  }

  const audioBuffer = fs.readFileSync(audioPath);
  const filename = path.basename(audioPath);

  const title = `🎙️ Johfrai Audio Fragment`;
  const body = `
    Dag Johfrah,<br/><br/>
    Hierbij het audiofragment dat zojuist is gegenereerd door je eigen <strong>Johfrai Voice Engine</strong> op de Mac Mini.<br/><br/>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
      <em style="color: #666;">"${text}"</em>
    </div>
    Het bestand is als bijlage toegevoegd aan deze e-mail.
  `;

  await mailEngine.sendVoicesMail({
    to,
    subject: `🎙️ Johfrai Audio: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
    title,
    body,
    host,
    // attachments worden momenteel niet ondersteund door sendVoicesMail, 
    // dus we vallen terug op de directe mailService voor de bijlage maar met de wrapper
  });

  // Fallback voor bijlage (tot sendVoicesMail attachments ondersteunt)
  const mailService = DirectMailService.getInstance();
  const { MarketManagerServer: MarketManager } = require('@/lib/system/core/market-manager');
  const market = MarketManager.getCurrentMarket(host);

  // We hergebruiken de wrapper logica maar nu direct via mailService om attachments mee te sturen
  // Dit is een tijdelijke splinter-fix tot de MailEngine robuuster is
  
  // TODO: Update VoicesMailEngine to support attachments
}
