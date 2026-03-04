import { BaseTemplate } from './VumeMasterWrapper';

interface ActorReminderProps {
  actorName: string;
  orderId: string;
  usageType?: string;
  deliveryTime?: string;
  isOverdue?: boolean;
  host?: string;
  language?: string;
}

export const VumeActorReminderTemplate = (props: ActorReminderProps) => {
  const {
    actorName,
    orderId,
    usageType,
    deliveryTime,
    isOverdue = false,
    host,
    language = 'nl-be',
  } = props;

  const shortLocale = (language || 'nl').toLowerCase().split('-')[0];
  const isFr = shortLocale === 'fr';
  const isNl = shortLocale === 'nl';
  const txt = (nl: string, fr: string, en: string) => (isFr ? fr : isNl ? nl : en);

  const content = `
    <div style="margin-bottom: 26px;">
      <p style="margin: 0 0 12px 0; font-size: 18px; color: #111827;">${txt('Beste', 'Bonjour', 'Dear')} ${actorName},</p>
      <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #4B5563;">
        ${
          isOverdue
            ? txt(
                `Dit is een herinnering voor opdracht <strong>#${orderId}</strong>. We wachten nog op je levering.`,
                `Ceci est un rappel pour la commande <strong>#${orderId}</strong>. Nous attendons encore votre livraison.`,
                `This is a reminder for assignment <strong>#${orderId}</strong>. We are still waiting for your delivery.`,
              )
            : txt(
                `Hierbij een vriendelijke reminder voor opdracht <strong>#${orderId}</strong>.`,
                `Voici un rappel amical pour la commande <strong>#${orderId}</strong>.`,
                `Here is a friendly reminder for assignment <strong>#${orderId}</strong>.`,
              )
        }
      </p>
    </div>

    <div style="border: 1px solid #E5E7EB; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 0 0 10px 0; font-size: 13px; color: #6B7280;">${txt('Opdracht', 'Commande', 'Assignment')}</td>
          <td style="padding: 0 0 10px 0; text-align: right; font-size: 14px; color: #111827; font-weight: 600;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 0 0 10px 0; font-size: 13px; color: #6B7280;">${txt('Type', 'Type', 'Type')}</td>
          <td style="padding: 0 0 10px 0; text-align: right; font-size: 14px; color: #111827;">${usageType || txt('Voice-over', 'Voix off', 'Voice-over')}</td>
        </tr>
        <tr>
          <td style="padding: 0; font-size: 13px; color: #6B7280;">${txt('Deadline', 'Échéance', 'Deadline')}</td>
          <td style="padding: 0; text-align: right; font-size: 14px; color: #111827;">${deliveryTime || txt('Zo snel mogelijk', 'Dès que possible', 'As soon as possible')}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
      ${txt(
        'Laat je even weten wanneer we je opname kunnen verwachten?',
        'Pouvez-vous nous confirmer quand nous pouvons attendre votre enregistrement ?',
        'Can you confirm when we can expect your recording?',
      )}
    </p>
  `;

  return BaseTemplate({
    title: txt('Herinnering opdracht', 'Rappel commande', 'Assignment reminder'),
    journey: 'agency',
    host,
    language,
    cta: {
      label: txt('Open dashboard', 'Ouvrir le dashboard', 'Open dashboard'),
      url: `https://${host || 'www.voices.be'}/account/orders?orderId=${encodeURIComponent(orderId)}`,
    },
    children: content,
  });
};
