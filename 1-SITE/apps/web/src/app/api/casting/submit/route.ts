import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DirectMailService } from '@/services/DirectMailService';
import { DropboxService } from '@/services/DropboxService';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { nanoid } from 'nanoid';

/**
 * 🎙️ CASTING SUBMISSION API (GOD MODE 2026)
 * 
 * Verwerkt de castingaanvraag, maakt records aan in Supabase,
 * en verstuurt een notificatie naar Johfrah (Admin).
 * 
 * CHRIS-PROTOCOL: 
 * - GEEN mails naar stemacteurs in testfase.
 * - Privacy-first: Sessie is beveiligd via unieke hash.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { 
      projectName, 
      clientName, 
      clientCompany, 
      clientEmail, 
      script, 
      selectedActors,
      selectedVibe 
    } = body;

    if (!projectName || !clientEmail || !selectedActors?.length) {
      return NextResponse.json({ success: false, error: 'Incomplete data' }, { status: 400 });
    }

    // 1. Zoek of maak gebruiker aan (Lead)
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', clientEmail)
      .single();

    if (!user) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: clientEmail,
          first_name: clientName,
          company_name: clientCompany,
          role: 'guest',
          journey_state: 'casting_lead'
        })
        .select()
        .single();
      
      if (userError) throw userError;
      user = newUser;
    }

    // 2. Maak een unieke sessie hash aan voor de Pitch/Casting sessie
    const sessionHash = nanoid(12);

    // 3. Dropbox Map aanmaken (Chris-Protocol: Automatisatie)
    const dropbox = DropboxService.getInstance();
    const dropboxUrl = await dropbox.createCastingFolder(projectName, sessionHash);

    // 4. Maak Audition records aan (Status: Invited)
    // CHRIS-PROTOCOL: We maken de records aan in de DB, maar versturen GEEN uitnodigingen naar de acteurs.
    const auditionPromises = selectedActors.map((actor: any) => {
      return supabase.from('auditions').insert({
        user_id: user!.id,
        actor_id: actor.id,
        status: 'invited',
        script: script,
        briefing: `Vibe: ${selectedVibe || 'Niet opgegeven'}`,
      });
    });

    await Promise.all(auditionPromises);

    // 5. Maak een Casting List aan voor de Collaborative Studio
    const { data: castingList, error: listError } = await supabase
      .from('casting_lists')
      .insert({
        user_id: user!.id,
        name: projectName,
        hash: sessionHash,
        is_public: false, // Privacy-first
        settings: {
          client_name: clientName,
          client_company: clientCompany,
          vibe: selectedVibe,
          script: script,
          dropbox_url: dropboxUrl // Sla de dropbox link op
        }
      })
      .select()
      .single();

    if (listError) throw listError;

    // 5b. Koppel de stemmen aan de casting lijst
    const listItemPromises = selectedActors.map((actor: any) => {
      return supabase.from('casting_list_items').insert({
        list_id: castingList.id,
        actor_id: actor.id,
        sort_order: 0
      });
    });

    const results = await Promise.all(listItemPromises);
    const errors = results.filter(r => r.error).map(r => r.error);
    if (errors.length > 0) {
      console.error(' [Casting Submit] List items error:', errors);
    }

    // 6. Notificatie naar Johfrah (Admin Only)
    const { VoicesMailEngine } = await import('@/services/VoicesMailEngine');
    const mailEngine = VoicesMailEngine.getInstance();
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    const market = MarketManager.getCurrentMarket(host);
    const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://www.voices.be`;

    await mailEngine.sendVoicesMail({
      to: market.email,
      subject: `🚀 Nieuwe Casting: ${projectName} (${clientCompany})`,
      title: 'Nieuwe Castingaanvraag',
      body: `
        <div style="background: #fcfaf7; padding: 30px; border-radius: 20px; margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: 400; margin-top: 0;">Project: ${projectName}</h2>
          <p style="font-size: 15px; color: #666;">
            <strong>Klant:</strong> ${clientName} (${clientCompany})<br>
            <strong>Email:</strong> ${clientEmail}<br>
            <strong>Vibe:</strong> ${selectedVibe || 'Standaard'}
          </p>
        </div>

        ${dropboxUrl ? `
        <div style="margin-bottom: 30px;">
          <a href="${dropboxUrl}" style="color: #0061ff; text-decoration: none; font-weight: bold;">📂 Open Dropbox Projectmap</a>
        </div>
        ` : ''}

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #ccc;">Geselecteerde Stemmen (${selectedActors.length})</h3>
          <ul style="list-style: none; padding: 0;">
            ${selectedActors.map((a: any) => `<li style="padding: 8px 0; border-bottom: 1px solid #f5f5f5;">${a.firstName || a.display_name}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #ccc;">Script</h3>
          <div style="font-style: italic; color: #1a1a1a; line-height: 1.6; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
            "${script}"
          </div>
        </div>
      `,
      buttonText: 'Open Collaborative Studio',
      buttonUrl: `${siteUrl}/casting/session/${sessionHash}`,
      host: host
    });

    return NextResponse.json({ 
      success: true, 
      sessionHash: sessionHash,
      redirectUrl: `/casting/session/${sessionHash}`
    });

  } catch (error: any) {
    console.error(' [Casting Submit] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
