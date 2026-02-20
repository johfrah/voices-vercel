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
    language = 'nl'
  } = props;

  const isNl = language === 'nl';

  const content = `
    <div style="margin-bottom: 30px;">
      <p style="font-size: 18px; color: #1a1a1a;">${isNl ? 'Beste' : 'Dear'} ${actorName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #666;">
        ${isNl 
          ? `Er staat een nieuwe opdracht voor je klaar op <strong>Voices.be</strong>. Hieronder vind je de details en het script.` 
          : `A new assignment is waiting for you on <strong>Voices.be</strong>. Below you will find the details and the script.`}
      </p>
    </div>

    <div style="background: #fcfaf7; border-radius: 20px; padding: 25px; border: 1px solid #eee; margin-bottom: 30px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 15px;">${isNl ? 'Project Details' : 'Project Details'}</div>
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
          <td style="padding-bottom: 10px; font-size: 14px; color: #999;">${isNl ? 'Type' : 'Type'}:</td>
          <td style="padding-bottom: 10px; font-size: 14px; color: #1a1a1a;">${usageType}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; font-size: 14px; color: #999;">${isNl ? 'Deadline' : 'Deadline'}:</td>
          <td style="padding-bottom: 10px; font-size: 14px; color: #ff4f00; font-weight: bold;">${deliveryTime}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">${isNl ? 'Het Script' : 'The Script'}</div>
      <div style="background: #fff; border: 2px solid #f0f0f0; border-radius: 15px; padding: 25px; font-size: 18px; line-height: 1.8; color: #1a1a1a; font-style: italic;">
        "${cleanText(script)}"
      </div>
    </div>

    ${briefing ? `
      <div style="margin-bottom: 30px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">${isNl ? 'Extra Briefing' : 'Extra Briefing'}</div>
        <div style="font-size: 15px; line-height: 1.6; color: #666;">
          ${cleanText(briefing)}
        </div>
      </div>
    ` : ''}

    <div style="background: #fff5f0; padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 79, 0, 0.1); margin-bottom: 30px;">
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
        ${isNl 
          ? 'Gelieve de opname zo snel mogelijk te verwerken en te uploaden via je dashboard. Voor vragen kun je direct reageren op deze mail.' 
          : 'Please process and upload the recording as soon as possible via your dashboard. For questions, you can reply directly to this email.'}
      </p>
    </div>
  `;

  return BaseTemplate({
    title: isNl ? 'Nieuwe Opdracht' : 'New Assignment',
    journey: 'agency',
    market: 'BE',
    children: content
  });
};
