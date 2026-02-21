import axios from 'axios';

/**
 * 🌉 PRIVATE VOICE BRIDGE (Mac Mini Edition)
 * 
 * Deze service is volledig geïsoleerd en dient als test-kanaal voor de 
 * eigen stem-kloon op de Mac Mini.
 * 
 * MANDAAT: Niet importeren in bestaande productie-flows (VoiceService.ts) 
 * totdat de validatie 100% voltooid is.
 */

export const PrivateVoiceBridge = {
  /**
   * Stuurt een tekst naar de lokale Mac Mini Engine via de beveiligde tunnel.
   */
  async generateAudio(text: string, speakerReference: string = 'johfrah-master.wav') {
    const tunnelUrl = process.env.NEXT_PUBLIC_MAC_MINI_TUNNEL_URL;
    
    if (!tunnelUrl) {
      console.warn('⚠️ Private Voice Bridge: Geen tunnel URL geconfigureerd.');
      return null;
    }

    try {
      const response = await axios.post(`${tunnelUrl}/generate`, {
        text,
        speaker_wav: speakerReference,
        language: 'nl'
      }, {
        responseType: 'arraybuffer',
        timeout: 30000 // 30s timeout voor AI generatie
      });

      return response.data;
    } catch (error) {
      console.error('❌ Private Voice Bridge Error:', error);
      throw new Error('Mac Mini Engine reageert niet.');
    }
  },

  /**
   * Status check om te zien of de Mac Mini 'Altijd Aan' staat.
   */
  async checkHealth() {
    const tunnelUrl = process.env.NEXT_PUBLIC_MAC_MINI_TUNNEL_URL;
    try {
      const res = await axios.get(`${tunnelUrl}/health`);
      return res.status === 200;
    } catch {
      return false;
    }
  }
};
