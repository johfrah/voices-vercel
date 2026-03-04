import { VumeMasterWrapper } from './VumeMasterWrapper';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

/**
 *  VUME DONATION THANK YOU TEMPLATE (2026)
 * 
 * Doel: Een warme, persoonlijke bedankmail voor donateurs van Youssef Zaki.
 * Bevat: Bedankvideo link, Spotify Early Access en Insider Circle info.
 */

interface DonationThankYouProps {
  name: string;
  amount: string;
  artistName: string;
  message?: string;
  host?: string;
  language?: string;
}

export const VumeDonationThankYouTemplate = (props: DonationThankYouProps) => {
  const {
    name,
    amount,
    artistName,
    message,
    host = (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', '')),
    language = 'nl-BE'
  } = props;
  const market = MarketManager.getCurrentMarket(host);

  const languageShort = (language || 'nl').toLowerCase().split('-')[0];
  const isNl = languageShort === 'nl';
  const isFr = languageShort === 'fr';
  const txt = (nl: string, fr: string, en: string) => (isFr ? fr : isNl ? nl : en);
  const amountLabel = Number.isFinite(Number(amount)) ? Number(amount).toFixed(2) : String(amount || '0');

  const content = `
    <div style="margin-bottom: 18px;">
      <p style="margin: 0 0 8px 0; font-size: 18px; color: #111827; font-weight: 600;">
        ${txt('Beste', 'Bonjour', 'Dear')} ${name},
      </p>
      <p style="margin: 0; font-size: 15px; line-height: 1.66; color: #4B5563;">
        ${txt(
          `Je donatie voor ${artistName} is goed ontvangen. Dankjewel voor je steun.`,
          `Votre don pour ${artistName} est bien reçu. Merci pour votre soutien.`,
          `Your donation for ${artistName} has been received. Thank you for your support.`
        )}
      </p>
    </div>

    <div style="border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; margin-bottom: 18px; background: #FFFFFF;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.09em; color: #9CA3AF; margin-bottom: 10px;">
        ${txt('Donatie-overzicht', 'Récapitulatif du don', 'Donation summary')}
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 8px; font-size: 14px; color: #4B5563;">${txt('Supporter', 'Supporter', 'Supporter')}</td>
          <td style="padding-bottom: 8px; text-align: right; font-size: 14px; color: #111827; font-weight: 600;">${name}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 14px; color: #4B5563;">${txt('Artiest', 'Artiste', 'Artist')}</td>
          <td style="padding-bottom: 8px; text-align: right; font-size: 14px; color: #111827;">${artistName}</td>
        </tr>
        <tr>
          <td style="padding-top: 10px; border-top: 1px solid #E5E7EB; font-size: 16px; color: #111827; font-weight: 700;">${txt('Bedrag', 'Montant', 'Amount')}</td>
          <td style="padding-top: 10px; border-top: 1px solid #E5E7EB; text-align: right; font-size: 18px; color: #111827; font-weight: 700;">€${amountLabel}</td>
        </tr>
      </table>
    </div>

    <div style="font-size: 14px; line-height: 1.64; color: #4B5563;">
      ${txt(
        'Je krijgt updates over nieuwe releases en studio-momenten.',
        'Vous recevez des mises à jour sur les nouvelles sorties et les sessions studio.',
        'You will receive updates about new releases and studio sessions.'
      )}
      ${message ? `<br /><br /><em style="color:#6B7280;">"${message}"</em>` : ''}
    </div>
  `;

  return VumeMasterWrapper(content, {
    title: txt('Bedankt voor je support', 'Merci pour votre soutien', 'Thank you for your support'),
    previewText: txt(
      `Beste ${name}, je donatie is goed ontvangen.`,
      `Bonjour ${name}, votre don est bien reçu.`,
      `Dear ${name}, your donation has been received.`
    ),
    journey: 'artist',
    host,
    market: market.market_code,
    language,
    cta: {
      label: txt('Volg nieuwe releases', 'Suivre les nouvelles sorties', 'Follow new releases'),
      url: `https://${host || 'www.youssefzaki.eu'}`,
    },
  });
};
