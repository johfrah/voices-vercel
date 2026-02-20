import { DirectMailService } from './DirectMailService';
import fs from 'fs';
import path from 'path';

/**
 * 🎙️ JOHFRAI MAIL BRIDGE
 * 
 * Doel: Versturen van gegenereerde audiofragmenten naar de gebruiker.
 */

export async function sendJohfraiAudio(to: string, audioPath: string, text: string) {
  const mailService = DirectMailService.getInstance();
  
  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audiobestand niet gevonden op pad: ${audioPath}`);
  }

  const audioBuffer = fs.readFileSync(audioPath);
  const filename = path.basename(audioPath);

  await mailService.sendMail({
    to,
    subject: `🎙️ Johfrai Audio: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
    text: `Dag Johfrah,\n\nHierbij het audiofragment dat zojuist is gegenereerd door je eigen Johfrai Voice Engine op de Mac Mini.\n\nTekst: "${text}"\n\nMet vriendelijke groet,\n\nJohfrai Bridge`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 20px;">
        <h2 style="color: #ff007a; font-weight: 300;">🎙️ Johfrai Audio Fragment</h2>
        <p>Dag Johfrah,</p>
        <p>Hierbij het audiofragment dat zojuist is gegenereerd door je eigen <strong>Johfrai Voice Engine</strong> op de Mac Mini.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <em style="color: #666;">"${text}"</em>
        </div>
        <p>Het bestand is als bijlage toegevoegd aan deze e-mail.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Verzonden vanaf de Mac Mini via de Voices.be Bridge.</p>
      </div>
    `,
    attachments: [
      {
        filename: filename,
        content: audioBuffer,
        contentType: 'audio/wav'
      }
    ]
  });

  console.log(`✅ Johfrai audio succesvol verzonden naar ${to}`);
}
