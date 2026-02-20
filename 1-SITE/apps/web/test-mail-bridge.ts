import { sendJohfraiAudio } from './src/services/JohfraiMailBridge';
import path from 'path';

/**
 * 🚀 JOHFRAI MAIL TESTER
 * 
 * Doel: Testen van de Johfrai Mail Bridge.
 */

async function testMail() {
  const to = 'johfrah@voices.be';
  const audioPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/docs/3-TECHNICAL-SPECS/private-voice-engine/storage/output.wav';
  const text = "Dag Johfrah, dit is je eigen stemkloon die rechtstreeks vanaf je Mac Mini spreekt. We zijn nu officieel onafhankelijk van ElevenLabs. Hoe klinkt dit voor een eerste test?";

  console.log(`🚀 Start mail test naar ${to}...`);
  
  try {
    await sendJohfraiAudio(to, audioPath, text);
    console.log('✅ Test geslaagd!');
  } catch (error) {
    console.error('❌ Test mislukt:', error);
  }
}

testMail();
