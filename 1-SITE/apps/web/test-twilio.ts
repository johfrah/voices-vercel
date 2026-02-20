import * as dotenv from 'dotenv';
import path from 'path';
import pkg from 'twilio';
const { Twilio } = pkg;

// Laad de .env.local variabelen
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const myNumber = process.env.MY_PERSONAL_NUMBER;

async function testTwilioCall() {
  console.log('🚀 Start Twilio Test Oproep...');
  console.log('Account SID:', accountSid ? 'Aanwezig' : 'MISSING');
  console.log('From Number:', fromNumber);
  console.log('To Number (Johfrah):', myNumber);

  if (!accountSid || !authToken || !fromNumber || !myNumber) {
    console.error('❌ Ontbrekende Twilio configuratie in .env.local');
    return;
  }

  const client = new Twilio(accountSid, authToken);

  try {
    console.log('📞 Oproep starten...');
    const call = await client.calls.create({
      from: fromNumber,
      to: myNumber,
      twiml: `<Response><Say voice="alice" language="nl-NL">Hoi Johfrah, dit is een test van de Voices punt b e bel-functie via Twilio. Het werkt!</Say></Response>`,
    });

    console.log('✅ Succes! Call SID:', call.sid);
    console.log('Check je iPhone, hij zou nu moeten rinkelen.');
  } catch (err: any) {
    console.error('❌ Twilio Fout:', err.message);
  }
}

testTwilioCall().catch(console.error);
