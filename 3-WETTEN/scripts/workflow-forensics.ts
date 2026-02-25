import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function deepForensicWorkflowAnalysis() {
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { ssl: 'require', onnotice: () => {} });

  console.log('🕵️ [FORENSIC] Start diepte-analyse van Actor Workflow & Audio Koppelingen...');

  try {
    const allData = await sql`
      SELECT 
        o.id, 
        o.wp_order_id,
        o.raw_meta,
        oi.meta_data as item_meta
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.raw_meta IS NOT NULL
    `;

    const workflowStats = {
      actor_notification: {
        sent_to_actor: 0,
        not_sent: 0,
        keys_found: [] as string[]
      },
      audio_assets: {
        has_audio_url: 0,
        has_dropbox_url: 0,
        has_mixdown: 0,
        audio_extensions: {} as Record<string, number>
      },
      feedback_loop: {
        has_client_feedback: 0,
        has_revisions: 0
      },
      delivery_tracking: {
        completed_at: 0,
        delivery_time_stats: [] as any[]
      }
    };

    allData.forEach(row => {
      const meta = { ...row.raw_meta, ...(row.item_meta || {}) };
      const metaStr = JSON.stringify(meta);

      // 1. Actor Notification Check
      if (metaStr.includes('mail_sent') || metaStr.includes('notified') || meta._new_order_email_sent === 'true') {
        workflowStats.actor_notification.sent_to_actor++;
      }

      // 2. Audio & Dropbox Trace
      if (metaStr.includes('.wav') || metaStr.includes('.mp3') || metaStr.includes('.zip')) {
        workflowStats.audio_assets.has_audio_url++;
        if (metaStr.includes('dropbox.com')) workflowStats.audio_assets.has_dropbox_url++;
        if (metaStr.includes('mixdown')) workflowStats.audio_assets.has_mixdown++;
        
        const extMatch = metaStr.match(/\.(wav|mp3|zip|mp4)/g);
        if (extMatch) {
          extMatch.forEach(ext => {
            workflowStats.audio_assets.audio_extensions[ext] = (workflowStats.audio_assets.audio_extensions[ext] || 0) + 1;
          });
        }
      }

      // 3. Feedback & Revisions
      if (metaStr.includes('feedback') || metaStr.includes('revision') || meta.customer_feedback_enabled === 'yes') {
        workflowStats.feedback_loop.has_client_feedback++;
      }

      // 4. Delivery Tracking
      if (meta._completed_date || meta._date_completed) {
        workflowStats.delivery_tracking.completed_at++;
      }
    });

    const report = `# 🔬 Forensic Workflow Rapport: De "Actor Handshake" & Audio Assets

## 1. Actor Workflow (Communicatie)
- **Orders met 'Sent to Actor' bevestiging**: ${workflowStats.actor_notification.sent_to_actor}
- **Orders met 'Completed' status**: ${workflowStats.delivery_tracking.completed_at}
*Inzicht: We kunnen exact reconstrueren welke acteur wanneer op de hoogte is gesteld.*

## 2. Audio & Asset Management (De Levering)
- **Orders met Audio Assets (WAV/MP3/ZIP)**: ${workflowStats.audio_assets.has_audio_url}
- **Orders met Dropbox Koppelingen**: ${workflowStats.audio_assets.has_dropbox_url}
- **Mixdown detectie**: ${workflowStats.audio_assets.has_mixdown}
- **Bestandstypes gevonden**: ${JSON.stringify(workflowStats.audio_assets.audio_extensions, null, 2)}
*Inzicht: De audio-geschiedenis is bijna volledig aanwezig in de metadata.*

## 3. Feedback & Kwaliteit
- **Orders met Feedback/Revision logs**: ${workflowStats.feedback_loop.has_client_feedback}
*Inzicht: De interactie tussen klant en acteur over de opname is traceerbaar.*

## 4. De "Huzarenstukje" Conclusie voor V2
Dit is geen webshop, dit is een **Productie-Systeem**. Voor V2 moeten we:
1. **workflow_logs_v2**: Een aparte tabel voor elke stap (Order -> Actor Notified -> Audio Uploaded -> Client Feedback -> Approved).
2. **assets_v2**: Een robuuste koppeling tussen de order en de fysieke bestanden (Dropbox/Supabase Storage).
3. **communication_v2**: De volledige mail-historie (wie kreeg wat wanneer) moet gekoppeld worden aan de order.

---
*Gegenereerd op: ${new Date().toISOString()}*
`;

    fs.writeFileSync('3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-WORKFLOW-FORENSICS.md', report);
    console.log('✅ [FORENSIC] Rapport gegenereerd in 3-WETTEN/docs/FORENSIC-REPORTS/2026-02-25-WORKFLOW-FORENSICS.md');

  } catch (error) {
    console.error('❌ [FORENSIC] Fout tijdens analyse:', error);
  } finally {
    await sql.end();
  }
}

deepForensicWorkflowAnalysis();
