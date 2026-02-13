import { NextResponse } from 'next/server';
import { sendTestMails } from '@/lib/mail/test-vume';

/**
 * 🧪 VUME TEST ENDPOINT
 * 
 * Alleen voor intern gebruik om de nieuwe mail engine te testen.
 */

export async function GET() {
  const recipient = 'johfrah@voices.be';
  const result = await sendTestMails(recipient);
  
  if (result.success) {
    return NextResponse.json({ message: `🚀 VUME Test Suite succesvol uitgevoerd. 3 mails verzonden naar ${recipient}.` });
  } else {
    return NextResponse.json({ error: 'Fout bij het uitvoeren van de test suite.', details: result.error }, { status: 500 });
  }
}
