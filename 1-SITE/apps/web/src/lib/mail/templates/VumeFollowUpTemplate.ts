import { BaseTemplate } from './VumeMasterWrapper';

/**
 * 👋 NEW CUSTOMER FOLLOW-UP TEMPLATE (2026)
 * 
 * Doel: Een week na de eerste bestelling vragen hoe de ervaring was.
 * Focus op persoonlijke luxe en vakmanschap.
 */

interface FollowUpProps {
  userName: string;
  orderId: string;
  actorName?: string;
  host?: string;
  language?: string;
}

export const VumeFollowUpTemplate = (props: FollowUpProps) => {
  const { 
    userName, 
    orderId, 
    actorName,
    host,
    language = 'nl'
  } = props;

  const isNl = language === 'nl';

  const content = `
    <div style="margin-bottom: 30px;">
      <p style="font-size: 18px; color: #1a1a1a;">${isNl ? 'Beste' : 'Dear'} ${userName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #666;">
        ${isNl 
          ? `Het is inmiddels een week geleden dat je je eerste bestelling (#${orderId}) bij ons hebt geplaatst. We zijn erg benieuwd hoe de samenwerking met <strong>${actorName || 'onze stemacteur'}</strong> is bevallen!` 
          : `It has been a week since you placed your first order (#${orderId}) with us. We are very curious how you liked working with <strong>${actorName || 'our voice actor'}</strong>!`}
      </p>
    </div>

    <div style="background: #fcfaf7; border-radius: 20px; padding: 25px; border: 1px solid #eee; margin-bottom: 30px; text-align: center;">
      <p style="font-size: 16px; color: #1a1a1a; margin-bottom: 20px;">
        ${isNl ? 'Was alles naar wens?' : 'Was everything to your satisfaction?'}
      </p>
      <div style="display: flex; justify-content: center; gap: 15px;">
        <a href="https://${host || 'www.voices.be'}/account/feedback?orderId=${orderId}&vibe=good" style="background: #ff4f00; color: #fff; padding: 12px 25px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px;">
          ${isNl ? 'Ja, top!' : 'Yes, great!'}
        </a>
        <a href="https://${host || 'www.voices.be'}/account/feedback?orderId=${orderId}&vibe=bad" style="background: #fff; color: #999; padding: 12px 25px; border-radius: 12px; text-decoration: none; border: 1px solid #eee; font-size: 14px;">
          ${isNl ? 'Kan beter' : 'Could be better'}
        </a>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <p style="font-size: 15px; line-height: 1.6; color: #666;">
        ${isNl 
          ? 'Bij Voices streven we naar absolute perfectie. Jouw feedback helpt ons om de lat telkens hoger te leggen voor ons vakmanschap.' 
          : 'At Voices, we strive for absolute perfection. Your feedback helps us to constantly raise the bar for our craftsmanship.'}
      </p>
    </div>

    <div style="background: #fff5f0; padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 79, 0, 0.1); margin-bottom: 30px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
        ${isNl 
          ? 'Heb je nog andere projecten op de plank liggen? We staan altijd klaar om je weer te helpen.' 
          : 'Do you have any other projects waiting? We are always ready to help you again.'}
      </p>
    </div>
  `;

  return BaseTemplate({
    title: isNl ? 'Hoe was je ervaring?' : 'How was your experience?',
    journey: 'agency',
    host,
    children: content
  });
};
