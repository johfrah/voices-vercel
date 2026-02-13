import { VumeEngine } from '@/lib/mail/VumeEngine';

/**
 * 🧪 VUME TEST SCRIPT (2026)
 * 
 * Doel: Versturen van voorbeeldmails naar Johfrah om de VUME-engine te valideren.
 */

export async function sendTestMails(recipient: string) {
  console.log(`🧪 Starting VUME Test Suite for ${recipient}...`);

  try {
    // 1. Test Magic Link (Auth Journey)
    await VumeEngine.send({
      to: recipient,
      subject: '✨ Test: Inloggen op Voices.be (VUME)',
      template: 'magic-link',
      context: {
        name: 'Johfrah',
        link: 'https://voices.be/auth/callback?token=test-token',
        language: 'nl'
      },
      host: 'voices.be'
    });
    console.log('✅ Magic Link test mail verzonden.');

    // 2. Test Studio Experience (Studio Journey)
    await VumeEngine.send({
      to: recipient,
      subject: '🎙️ Test: Je plek in de studio (VUME)',
      template: 'studio-experience',
      context: {
        name: 'Johfrah',
        workshopName: 'Masterclass Stemacteren',
        date: '25 februari 2026',
        time: '14:00',
        location: 'Voices Studio, Gent',
        headerImage: 'https://voices-vercel.vercel.app/assets/common/branding/email/headers/default-header.jpg',
        language: 'nl'
      },
      host: 'voices.be'
    });
    console.log('✅ Studio Experience test mail verzonden.');

    // 3. Test Invoice Reply (Agency Journey)
    await VumeEngine.send({
      to: recipient,
      subject: '🧾 Test: Factuur goed ontvangen (VUME)',
      template: 'invoice-reply',
      context: {
        userName: 'Johfrah',
        invoiceNumber: 'INV-2026-001',
        amount: 1250.50,
        language: 'nl'
      },
      host: 'voices.be'
    });
    console.log('✅ Invoice Reply test mail verzonden.');

    return { success: true };
  } catch (error) {
    console.error('❌ VUME Test Suite Failed:', error);
    return { success: false, error };
  }
}
