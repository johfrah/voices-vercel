import { BaseTemplate } from './VumeMasterWrapper';
import { cleanText } from '@/lib/utils';

/**
 * 🎙️ ACTOR ASSIGNMENT TEMPLATE (2026)
 * 
 * Doel: Een professionele en volledige briefing voor de stemacteur.
 */

interface ActorAssignmentProps {
  actorName: string;
  orderId: string;
  clientName: string;
  clientCompany?: string;
  usageType: string;
  script: string;
  briefing?: string;
  deliveryTime?: string;
  host?: string;
  language?: string;
}

export const VumeActorAssignmentTemplate = (props: ActorAssignmentProps) => {
  const { 
    actorName, 
    orderId, 
    clientName, 
    clientCompany, 
    usageType, 
    script, 
    briefing, 
    deliveryTime = 'binnen 48 uur',
    host,
    language = 'nl-be'
  } = props;

  const languageShort = (language || 'nl').toLowerCase().split('-')[0];
  const isNl = languageShort === 'nl';

  const content = `
    <div style="margin-bottom: 30px;">
      <p style="font-size: 18px; color: #1a1a1a;">${isNl ? 'Beste' : 'Dear'} ${actorName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #666;">
        ${isNl 
          ? `Er staat een nieuwe opdracht voor je klaar op <strong>${host || 'Voices'}</strong>. Hieronder vind je de details en het script.` 
          : `A new assignment is waiting for you on <strong>${host || 'Voices'}</strong>. Below you will find the details and the script.`}
      </p>
    </div>

    <div style="background: #ffffff; border-radius: 16px; padding: 22px; border: 1px solid #E5E7EB; margin-bottom: 24px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 15px;">${isNl ? 'Over de opdracht' : 'Project Details'}</div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="40%" style="padding-bottom: 10px; font-size: 14px; color: #999;">${isNl ? 'Order ID' : 'Order ID'}:</td>
          <td style="padding-bottom: 10px; font-size: 14px; color: #1a1a1a; font-weight: bold;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; font-size: 14px; color: #999;">${isNl ? 'Klant' : 'Client'}:</td>
          <td style="padding-bottom: 10px; font-size: 14px; color: #1a1a1a;">${clientName} ${clientCompany ? `(${clientCompany})` : ''}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; font-size: 14px; color: #999;">${isNl ? 'Gebruik' : 'Type'}:</td>
          <td style="padding-bottom: 10px; font-size: 14px; color: #1a1a1a;">${usageType}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; font-size: 14px; color: #999;">${isNl ? 'Deadline' : 'Deadline'}:</td>
          <td style="padding-bottom: 10px; font-size: 14px; color: #111827; font-weight: 600;">${deliveryTime}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">${isNl ? 'Het Script' : 'The Script'}</div>
      <div style="background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; padding: 22px; font-size: 17px; line-height: 1.75; color: #1a1a1a; font-style: italic;">
        "${cleanText(script)}"
      </div>
    </div>

    ${briefing ? `
      <div style="margin-bottom: 30px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">${isNl ? 'Regie-aanwijzingen' : 'Extra Briefing'}</div>
        <div style="font-size: 15px; line-height: 1.6; color: #666;">
          ${cleanText(briefing)}
        </div>
      </div>
    ` : ''}

    <div style="background: #F9FAFB; padding: 18px; border-radius: 12px; border: 1px solid #E5E7EB; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
        ${isNl 
          ? 'Graag de opname uploaden via je overzicht. Voor vragen kun je direct reageren op deze mail.' 
          : 'Please process and upload the recording as soon as possible via your dashboard. For questions, you can reply directly to this email.'}
      </p>
    </div>
  `;

  return BaseTemplate({
    title: isNl ? `Nieuwe opname voor ${clientName}` : 'New Assignment',
    journey: 'agency',
    host,
    language,
    children: content
  });
};
