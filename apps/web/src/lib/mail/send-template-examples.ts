import { VumeEngine } from './VumeEngine';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

type ExampleLanguage = 'nl-be' | 'fr-fr' | 'en-gb';

const SAMPLE_HOST_BY_LANGUAGE: Record<ExampleLanguage, string> = {
  'nl-be': 'www.voices.be',
  'fr-fr': 'www.voices.fr',
  'en-gb': 'www.voices.eu',
};

async function sendOrderExample(recipient: string, language: ExampleLanguage): Promise<void> {
  const host = SAMPLE_HOST_BY_LANGUAGE[language];
  const orderId = `${language.replace('-', '').toUpperCase()}-${Date.now().toString().slice(-6)}`;

  await VumeEngine.send({
    to: recipient,
    from: 'johfrah@voices.be',
    subject:
      language === 'fr-fr'
        ? `Exemple mise en page commande: #${orderId}`
        : language === 'en-gb'
          ? `Order layout example: #${orderId}`
          : `Voorbeeld mail lay-out bestelling: #${orderId}`,
    template: 'order-confirmation',
    host,
    language,
    context: {
      userName: language === 'fr-fr' ? 'Jean' : language === 'en-gb' ? 'Alex' : 'Sofie',
      orderId,
      subtotal: 365,
      tax: 76.65,
      total: 441.65,
      paymentMethod: language === 'fr-fr' ? 'Carte bancaire' : language === 'en-gb' ? 'Credit card' : 'Bancontact',
      ctaUrl: `https://${host}/account/orders?orderId=${encodeURIComponent(orderId)}`,
      items: [
        {
          name: language === 'fr-fr' ? 'Voice-over principal' : language === 'en-gb' ? 'Main voice-over' : 'Hoofdstem opname',
          description:
            language === 'fr-fr'
              ? 'Commercial TV • FR • Belgique'
              : language === 'en-gb'
                ? 'TV commercial • EN • UK'
                : 'TV commercial • NL • België',
          quantity: 1,
          unitPrice: 275,
          price: 275,
          deliveryTime: language === 'fr-fr' ? 'Sous 24 heures' : language === 'en-gb' ? 'Within 24 hours' : 'Binnen 24 uur',
          projectCode: `PRJ-${orderId}`,
          thumbnailUrl: `https://${host}/api/proxy?path=${encodeURIComponent('/assets/common/branding/founder/johfrah.png')}&v=20260213`,
        },
        {
          name: language === 'fr-fr' ? 'Musique de fond' : language === 'en-gb' ? 'Background music' : 'Achtergrondmuziek',
          description:
            language === 'fr-fr'
              ? 'Track cinématique premium'
              : language === 'en-gb'
                ? 'Premium cinematic track'
                : 'Premium cinematic track',
          quantity: 1,
          unitPrice: 90,
          price: 90,
          projectCode: `MUS-${orderId}`,
          thumbnailUrl: `https://${host}/icon-workshop.svg`,
        },
      ],
    },
  });
}

async function sendStudioExample(recipient: string): Promise<void> {
  await VumeEngine.send({
    to: recipient,
    from: 'johfrah@voices.be',
    subject: 'Voorbeeld studio-mail lay-out',
    template: 'studio-experience',
    host: 'www.voices.be',
    language: 'nl-be',
    context: {
      name: 'Sofie',
      workshopName: 'Masterclass Stemacteren',
      date: '15 april 2026',
      time: '14:00',
      location: 'Voices Studio, Brussel',
      language: 'nl-be',
    },
  });
}

async function sendArtistExample(recipient: string): Promise<void> {
  await VumeEngine.send({
    to: recipient,
    from: 'johfrah@voices.be',
    subject: 'Voorbeeld artist-dankmail lay-out',
    template: 'donation-thank-you',
    host: 'www.youssefzaki.eu',
    language: 'en-gb',
    context: {
      name: 'Alex',
      amount: '25.00',
      artistName: 'Youssef Zaki',
      message: 'Thank you for your music.',
      language: 'en-gb',
    },
  });
}

export async function sendTemplateExamples(recipient: string): Promise<void> {
  await sendOrderExample(recipient, 'nl-be');
  await sendOrderExample(recipient, 'fr-fr');
  await sendOrderExample(recipient, 'en-gb');
  await sendStudioExample(recipient);
  await sendArtistExample(recipient);
}

async function runCli(): Promise<void> {
  const recipient = process.argv[2] || 'johfrah@voices.be';
  await sendTemplateExamples(recipient);
  console.log(`[mail-examples] Sent examples to ${recipient}`);
}

if ((process.argv[1] || '').includes('send-template-examples.ts')) {
  runCli().catch((error) => {
    console.error('[mail-examples] Failed:', error);
    process.exit(1);
  });
}
