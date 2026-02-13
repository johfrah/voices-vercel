import { NextResponse } from 'next/server';
import { sendTestMails } from '@/lib/mail/test-vume';
import { VumeEngine } from '@/lib/mail/VumeEngine';

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

export async function POST(request: Request) {
  try {
    const { templateId, recipient, context } = await request.json();
    
    await VumeEngine.send({
      to: recipient || 'johfrah@voices.be',
      subject: `VUME Preview: ${templateId}`,
      template: templateId,
      context: context || {},
      host: 'voices.be'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Verzenden mislukt' }, { status: 500 });
  }
}
