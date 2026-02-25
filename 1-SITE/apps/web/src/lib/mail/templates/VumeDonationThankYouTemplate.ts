import { VumeMasterWrapper } from './VumeMasterWrapper';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

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
  const { name, amount, artistName, host = (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', '')), language = 'nl-BE' } = props;
  const market = MarketManager.getCurrentMarket(host);

  const isNl = language === 'nl';

  const content = `
    <div style="text-align: center; padding: 20px 0;">
      <h1 style="font-family: 'Raleway', sans-serif; font-weight: 300; font-size: 32px; color: #1a1a1a; margin-bottom: 10px;">
        ${isNl ? 'Bedankt voor je support!' : 'Thank you for your support!'}
      </h1>
      <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
        ${isNl 
          ? `Beste ${name}, je donatie van €${amount} voor ${artistName} is goed ontvangen.` 
          : `Dear ${name}, your donation of €${amount} for ${artistName} has been received.`}
      </p>

      <!-- 🎬 PERSONAL THANK YOU VIDEO -->
      <div style="background: #f9f9f9; border-radius: 20px; padding: 30px; margin-bottom: 40px; border: 1px solid #eee;">
        <h2 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #ff0080; margin-bottom: 20px;">
          ${isNl ? 'Een persoonlijke boodschap' : 'A personal message'}
        </h2>
        <p style="margin-bottom: 25px; color: #444;">
          ${isNl 
            ? 'Youssef heeft een korte video voor je opgenomen om je persoonlijk te bedanken.' 
            : 'Youssef has recorded a short video to personally thank you.'}
        </p>
        <a href="https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/visuals/youssef/thank-you-video.mp4" 
           style="display: inline-block; background: #1a1a1a; color: #fff; padding: 18px 35px; border-radius: 10px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">
          ${isNl ? 'Bekijk de video' : 'Watch the video'}
        </a>
      </div>

      <!-- 🎵 INSIDER CIRCLE & SPOTIFY -->
      <div style="text-align: left; margin-bottom: 40px;">
        <h3 style="font-size: 20px; font-weight: 300; color: #1a1a1a; margin-bottom: 15px;">
          ${isNl ? 'Welkom bij de Insider Circle' : 'Welcome to the Insider Circle'}
        </h3>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          ${isNl 
            ? `Als supporter ben je nu onderdeel van Youssef's reis. Je krijgt als eerste toegang tot nieuwe demo's en behind-the-scenes beelden van de studio-opnames.` 
            : `As a supporter, you are now part of Youssef's journey. You'll get early access to new demos and behind-the-scenes footage from the studio sessions.`}
        </p>
        
        <div style="background: #1DB954; border-radius: 15px; padding: 20px; color: #fff; display: flex; align-items: center; gap: 15px;">
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: 900; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; opacity: 0.8;">
              Spotify Early Access
            </p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">
              ${isNl ? 'Volg de exclusieve pre-release playlist' : 'Follow the exclusive pre-release playlist'}
            </p>
          </div>
          <a href="https://open.spotify.com/artist/youssefzaki" style="background: #fff; color: #1DB954; padding: 10px 20px; border-radius: 30px; text-decoration: none; font-weight: 900; font-size: 11px; text-transform: uppercase;">
            Open Spotify
          </a>
        </div>
      </div>

      <p style="font-size: 12px; color: #999; font-style: italic;">
        ${isNl 
          ? '* Dit is een pure donatie. Er zijn geen goederen of diensten geleverd in ruil voor deze bijdrage.' 
          : '* This is a pure donation. No goods or services were provided in exchange for this contribution.'}
      </p>
    </div>
  `;

  return VumeMasterWrapper(content, {
    title: isNl ? 'Bedankt voor je support!' : 'Thank you for your support!',
    previewText: isNl ? `Beste ${name}, je donatie is goed ontvangen.` : `Dear ${name}, your donation has been received.`,
    journey: 'artist',
    host,
    market: market.market_code
  });
};
