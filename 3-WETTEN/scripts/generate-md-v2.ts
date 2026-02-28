
import { db } from '../../1-SITE/apps/web/src/lib/system/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

// Helper function to map Lucide names to Emojis for MD readability
function getEmojiForIcon(iconName: string): string {
  const mapping: Record<string, string> = {
    'coffee': '☕',
    'mic': '🎙️',
    'utensils': '🍴',
    'users': '👥',
    'flag': '🏁',
    'video': '🎥',
    'clapperboard': '🎬',
    'check-circle': '✅',
    'help-circle': '❓',
    'radio': '📻',
    'music': '🎵',
    'book-open': '📖',
    'message-square': '💬',
    'star': '⭐',
    'mouth': '👄'
  };
  return mapping[iconName] || '📝';
}

// Helper to render dots for scores
function renderDots(score: number): string {
  const full = '●';
  const empty = '○';
  return full.repeat(score) + empty.repeat(5 - score);
}

async function generateMD() {
  console.log('📄 Generating SUPABASE_WORKSHOP_CONTENT.md with Assets & Journeys...');

  // 1. Fetch Taxonomy
  const taxonomy = await db.execute(sql`
    SELECT 
      tm.workshop_id,
      c.label_nl as category_label,
      c.slug as category_slug,
      t.label_nl as type_label,
      t.slug as type_slug
    FROM workshop_taxonomy_mappings tm
    JOIN workshop_categories c ON tm.category_id = c.id
    JOIN workshop_types t ON tm.type_id = t.id
  `);

  const taxonomyMap = (taxonomy as any[]).reduce((acc: any, curr: any) => {
    acc[curr.workshop_id] = curr;
    return acc;
  }, {});

  // 2. Fetch Skill DNA
  const skillDna = await db.execute(sql`
    SELECT 
      sd.workshop_id,
      s.label_nl,
      sd.score,
      s.slug
    FROM workshop_skill_dna sd
    JOIN workshop_skills s ON sd.skill_id = s.id
    ORDER BY CASE 
      WHEN s.slug = 'stem_techniek_fysiek' THEN 1
      WHEN s.slug = 'stem_techniek' THEN 2
      WHEN s.slug = 'inleving_spel' THEN 3
      WHEN s.slug = 'creativiteit' THEN 4
      WHEN s.slug = 'microfoon_studio' THEN 5
      WHEN s.slug = 'markt_business' THEN 6
      ELSE 7 END ASC
  `);

  const skillMap = (skillDna as any[]).reduce((acc: any, curr: any) => {
    if (!acc[curr.workshop_id]) acc[curr.workshop_id] = [];
    acc[curr.workshop_id].push(curr);
    return acc;
  }, {});

  // 3. Fetch Experience Levels
  const levels = await db.execute(sql`
    SELECT 
      lm.workshop_id,
      el.label_nl
    FROM workshop_level_mappings lm
    JOIN workshop_experience_levels el ON lm.level_id = el.id
    ORDER BY el.id ASC
  `);

  const levelMap = (levels as any[]).reduce((acc: any, curr: any) => {
    if (!acc[curr.workshop_id]) acc[curr.workshop_id] = [];
    acc[curr.workshop_id].push(curr.label_nl);
    return acc;
  }, {});

  // 4. Fetch Journeys (Next Steps)
  const journeys = await db.execute(sql`
    SELECT wj.from_workshop_id, wj.label_nl, w.title as to_workshop_title
    FROM workshop_journeys wj
    JOIN workshops w ON w.id = wj.to_workshop_id
  `);

  const journeyMap = (journeys as any[]).reduce((acc: any, curr: any) => {
    if (!acc[curr.from_workshop_id]) acc[curr.from_workshop_id] = [];
    acc[curr.from_workshop_id].push(curr);
    return acc;
  }, {});

  // 5. Fetch Edition Vault Links
  const vaultLinks = await db.execute(sql`
    SELECT edition_id, vault_folder_path, label_nl
    FROM workshop_edition_vault_links
  `);

  const vaultMap = (vaultLinks as any[]).reduce((acc: any, curr: any) => {
    acc[curr.edition_id] = curr;
    return acc;
  }, {});

  // 6. Fetch all FAQs linked to workshops
  const allFaqs = await db.execute(sql`
    SELECT f.id, f.question_nl, f.answer_nl, fm.workshop_id, f.category
    FROM faq f
    LEFT JOIN faq_mappings fm ON fm.faq_id = f.id
    WHERE (fm.workshop_id IS NOT NULL OR f.target_entity_type = 'workshop')
    AND f.is_public = true
    ORDER BY f.category, f.display_order
  `);

  // 7. Fetch all Media linked to workshops
  const allMedia = await db.execute(sql`
    SELECT wm.workshop_id, wm.media_type, m.id, m.file_name, m.file_path, m.world_id
    FROM workshop_media wm
    JOIN media m ON m.id = wm.media_id
  `);

  // 8. Fetch all Reviews linked to workshops
  const allReviews = await db.execute(sql`
    SELECT wr.workshop_id, r.author_name, r.rating, r.text_nl, r.id
    FROM workshop_reviews wr
    JOIN reviews r ON r.id = wr.review_id
  `);

  // 9. Fetch all Instructors
  const allInstructors = await db.execute(sql`
    SELECT id, name, tagline, bio, photo_id, slug, socials
    FROM instructors
  `);

  // 10. Fetch all Locations
  const allLocations = await db.execute(sql`
    SELECT id, name, address, city, zip, country, description, map_url
    FROM locations
  `);

  // 11. Fetch Workshop-Instructor Mappings (Direct + Edition)
  const instructorMappings = await db.execute(sql`
    SELECT DISTINCT i.id as instructor_id, w.id as workshop_id
    FROM instructors i
    JOIN workshops w ON w.instructor_id = i.id
    UNION
    SELECT DISTINCT i.id as instructor_id, we.workshop_id
    FROM instructors i
    JOIN edition_instructors ei ON ei.instructor_id = i.id
    JOIN workshop_editions we ON we.id = ei.edition_id
  `);

  // 12. Fetch Workshop-Location Mappings
  const locationMappings = await db.execute(sql`
    SELECT DISTINCT l.id as location_id, we.workshop_id
    FROM locations l
    JOIN workshop_editions we ON we.location_id = l.id
  `);

  // 13. Fetch Internal Feedback (Relational)
  const internalFeedback = await db.execute(sql`
    SELECT 
      wf.workshop_id, 
      u.first_name, 
      u.last_name, 
      wf.rating_relevance, 
      wf.rating_knowledge, 
      wf.text_most_valuable, 
      wf.public_snippet,
      wf.public_rating,
      wf.submitted_at,
      we.date as edition_date
    FROM workshop_feedback wf
    LEFT JOIN users u ON u.id = wf.user_id
    LEFT JOIN workshop_editions we ON we.id = wf.edition_id
    ORDER BY wf.submitted_at DESC
  `);

  const feedbackMap = (internalFeedback as any[]).reduce((acc: any, curr: any) => {
    if (!acc[curr.workshop_id]) acc[curr.workshop_id] = [];
    acc[curr.workshop_id].push(curr);
    return acc;
  }, {});

    const workshops = await db.execute(sql`
    WITH edition_participants AS (
      SELECT 
        edition_id,
        json_agg(jsonb_build_object(
          'name', participant_name,
          'email', participant_email,
          'phone', participant_phone,
          'age', participant_age,
          'profession', participant_profession,
          'experience', participant_experience,
          'order_id', order_id,
          'buyer_name', buyer_name,
          'is_different_from_buyer', is_different_from_buyer,
          'interest_status', interest_status,
          'amount_net', amount_net,
          'amount_total', amount_total
        )) as participants,
        SUM(amount_net) as total_edition_net,
        SUM(amount_total) as total_edition_gross
      FROM view_workshop_participants
      WHERE edition_id IS NOT NULL
      GROUP BY edition_id
    )
    SELECT w.id, w.title, w.slug, w.is_public, w.has_demo_bundle, w.preparation_template,
           ws.label as status_label, ws.id as status_id,
           w.meta,
           wm.file_path as featured_image_path,
           wi.id as direct_instructor_id, wi.name as direct_instructor_name, wi.tagline as direct_instructor_tagline,
           json_agg(DISTINCT jsonb_build_object('id', i.id, 'name', i.name, 'tagline', i.tagline)) FILTER (WHERE i.id IS NOT NULL) as edition_instructors,
           json_agg(DISTINCT jsonb_build_object(
             'id', we.id, 
             'date', we.date, 
             'start_time', we.start_time,
             'end_time', we.end_time,
             'status_label', wes.label,
             'status_id', wes.id,
             'location_id', we.location_id,
             'location_name', l.name,
             'program', we.program,
             'participants', ep.participants,
             'total_net', ep.total_edition_net,
             'total_gross', ep.total_edition_gross
           )) FILTER (WHERE we.id IS NOT NULL) as editions
    FROM workshops w
    LEFT JOIN workshop_statuses ws ON ws.id = w.status_id
    LEFT JOIN media wm ON wm.id = w.media_id
    LEFT JOIN instructors wi ON wi.id = w.instructor_id
    LEFT JOIN workshop_editions we ON we.workshop_id = w.id
    LEFT JOIN workshop_statuses wes ON wes.id = we.status_id
    LEFT JOIN locations l ON l.id = we.location_id
    LEFT JOIN edition_instructors ei ON ei.edition_id = we.id
    LEFT JOIN instructors i ON i.id = ei.instructor_id
    LEFT JOIN edition_participants ep ON ep.edition_id = we.id
    WHERE w.id IN (260250, 260261, 260263, 260265, 260266, 260271, 260272, 260273, 260274, 263913, 267780, 267781, 272702, 272907, 274488)
    GROUP BY w.id, ws.id, wm.file_path, wi.id, wi.name, wi.tagline
    ORDER BY w.title ASC
  `);

  let md = `# 🎙️ SUPABASE WORKSHOP CONTENT (Nuclear Truth)\n\n`;
  md += `*Generated on: ${new Date().toISOString()}*\n\n`;

  md += `## 🏗️ Database Architectuur (Heldere Inzichten)\n`;
  md += `Om de database helder en doorzoekbaar te maken, gebruiken we nu een **Database View** en **Junction Tables**.\n\n`;
  md += `💡 **Smart Assets (Vault):** Workshops met \`has_demo_bundle = true\` tonen verwachtingen vooraf. Edities worden via \`workshop_edition_vault_links\` hard gekoppeld aan folders.\n`;
  md += `💡 **Related Journeys:** De ideale leerroute is via \`workshop_journeys\` (Next Steps) hard verankerd.\n`;
  md += `💡 **Hard Review Handshake:** Reviews zijn nu via \`workshop_reviews\` hard verbonden aan workshops.\n`;
  md += `💡 **Expert Note:** Elke workshop heeft een begeleidend zinnetje dat de ziel van de dag vangt.\n`;
  md += `💡 **6 Pijlers van Vakmanschap:** Elke workshop is gescoord op *Stemtechniek, Uitspraak, Intonatie, Storytelling, Studiotechniek* en *Business*.\n`;
  md += `💡 **Smart Experience Levels:** Niveaus (Starter, Basis) zijn via \`workshop_level_mappings\` gekoppeld.\n`;
  md += `💡 **Hard Taxonomy Handshake:** Workshops zijn nu via \`workshop_taxonomy_mappings\` verbonden aan Pijlers (Categories) en Types (Anker/Gast).\n`;
  md += `💡 **Hard Media Handshake:** Video's en afbeeldingen zijn nu via \`workshop_media\` hard verbonden aan de centrale \`media\` tabel.\n`;
  md += `💡 **Hard Handshake FAQ:** FAQ's zijn via \`faq_mappings\` verbonden.\n`;
  md += `💡 **Zichtbaarheid:** We gebruiken de kolom \`is_public\` voor frontend-filtering.\n`;
  md += `💡 **Status Systeem:** Workshops en edities gebruiken de \`workshop_statuses\` koppeltabel.\n\n`;
  md += `---\n\n`;
  
  md += `## 📊 Overzicht Integriteit & Classificatie\n\n`;
  md += `| ID | Workshop Title | Pijler | Type | Status | Public | Bundle | Media | FAQ | Reviews |\n`;
  md += `|---|---|---|---|---|---|---|---|---|---|\n`;

  workshops.forEach((w: any) => {
    const tax = taxonomyMap[w.id] || { category_label: '❌', type_label: '❌' };
    const hasMedia = allMedia.some((m: any) => m.workshop_id === w.id);
    const mediaStatus = hasMedia ? '🤝 Hard' : '❌';
    const isPublic = w.is_public ? '✅ Ja' : '🔒 Nee';
    const bundleStatus = w.has_demo_bundle ? '📦 Ja' : '❌ Nee';
    const hasSpecificFaq = allFaqs.some((f: any) => f.workshop_id === w.id);
    const faqStatus = hasSpecificFaq ? '🤝 Hard' : '🌐 Gen';
    const reviewCount = allReviews.filter((r: any) => r.workshop_id === w.id).length;
    
    md += `| ${w.id} | ${w.title} | ${tax.category_label} | ${tax.type_label} | ${w.status_label || '❌'} | ${isPublic} | ${bundleStatus} | ${mediaStatus} | ${faqStatus} | ${reviewCount > 0 ? '🤝 ' + reviewCount : '❌'} |\n`;
  });

  md += `\n---\n\n`;

  workshops.forEach((w: any) => {
    const meta = w.meta || {};
    const tax = taxonomyMap[w.id] || { category_label: 'Onbekend', type_label: 'Onbekend' };
    const skills = skillMap[w.id] || [];
    const workshopLevels = levelMap[w.id] || [];
    const workshopReviews = allReviews.filter((r: any) => r.workshop_id === w.id);
    const nextSteps = journeyMap[w.id] || [];
    
    md += `## 📦 [${w.id}] ${w.title}\n\n`;
    
    md += `### 🏗️ Structurele Classificatie\n`;
    md += `- **Pijler**: ${tax.category_label}\n`;
    md += `- **Type**: ${tax.type_label}\n`;
    md += `- **Demo Bundle Aanwezig**: ${w.has_demo_bundle ? '✅ Ja (Deelnemers ontvangen opnames)' : '❌ Nee (Geen opnames voorzien)'}\n\n`;

    md += `### 💡 Expert Note\n> *${meta.expert_note || '❌ Geen expert note aanwezig'}*\n\n`;

    md += `### 🧠 Smart Skill DNA & Niveau\n`;
    if (skills.length > 0) {
      md += `| Onderdeel | Score | Visual | Niveau |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      
      skills.forEach((s: any, index: number) => {
        const levelStr = index === 0 ? workshopLevels.join(', ') : '';
        md += `| ${s.label_nl} | ${s.score}/5 | ${renderDots(s.score)} | ${levelStr} |\n`;
      });
      md += `\n`;
    } else {
      md += `❌ Geen Skill DNA data aanwezig\n\n`;
    }

    md += `### 🔗 Volgende Stappen (Related Journey)\n`;
    if (nextSteps.length > 0) {
      nextSteps.forEach((ns: any) => {
        md += `- **${ns.label_nl}:** [${ns.to_workshop_title}]\n`;
      });
    } else {
      md += `❌ Geen specifieke volgende stappen verankerd\n`;
    }
    md += `\n`;

    md += `### ⭐ Gekoppelde Reviews (Hard Handshake)\n`;
    if (workshopReviews.length > 0) {
      workshopReviews.forEach((r: any) => {
        md += `- **${r.author_name} (${r.rating}/5):** "${r.text_nl.substring(0, 150)}..." (ID: \`${r.id}\`)\n`;
      });
    } else {
      md += `❌ Geen publieke reviews gekoppeld\n`;
    }
    md += `\n`;

    md += `### 📝 Interne Feedback (Privé)\n`;
    const workshopFeedback = feedbackMap[w.id] || [];
    if (workshopFeedback.length > 0) {
      md += `| Deelnemer | Datum | Score | Vakkennis | Meest Waardevol | Frontend Snippet |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      workshopFeedback.forEach((f: any) => {
        const dateStr = f.submitted_at ? new Date(f.submitted_at).toLocaleDateString('nl-BE') : 'Onbekend';
        const stars = f.public_rating ? '⭐'.repeat(f.public_rating) : '❌';
        const val = f.text_most_valuable ? f.text_most_valuable.substring(0, 80).replace(/\n/g, ' ') + '...' : '-';
        const snippet = f.public_snippet ? `✅ "${f.public_snippet.substring(0, 80)}..."` : '❌ Geen snippet';
        const fullName = [f.first_name, f.last_name].filter(Boolean).join(' ') || 'Anoniem';
        md += `| ${fullName} | ${dateStr} | ${stars} | ${f.rating_knowledge || '-'} | ${val} | ${snippet} |\n`;
      });
    } else {
      md += `❌ Geen interne feedback aanwezig\n`;
    }
    md += `\n`;

    md += `### ⚙️ Configuratie\n`;
    md += `- **Slug:** \`${w.slug}\`  \n`;
    md += `- **Status:** \`${w.status_label}\` (ID: \`${w.status_id}\`)  \n`;
    md += `- **Zichtbaarheid:** ${w.is_public ? '✅ Publiek (Zichtbaar op site)' : '🔒 Privé (Verborgen op site)'}  \n\n`;

    md += `### 📝 Korte Beschrijving (Teaser)\n${meta.short_description || '❌'}\n\n`;
    md += `### 📖 Uitgebreide Workshop Inhoud\n${meta.workshop_content_detail || '❌'}\n\n`;
    md += `### 🎬 Aftermovie & Context\n${meta.aftermovie_description || '❌'}\n\n`;
    
    md += `### ✉️ Mail Voorbereiding (Template)\n`;
    if (w.preparation_template) {
      md += `> ${w.preparation_template.replace(/\n/g, '\n> ')}\n`;
    } else {
      md += `❌ Geen voorbereidings-template aanwezig\n`;
    }
    md += `\n`;
    
    md += `### 📅 Standaard Dagindeling (Blueprint)\n`;
    if (meta.day_schedule) {
      if (typeof meta.day_schedule === 'object' && meta.day_schedule.type === 'structured') {
        md += `💡 **Database Status:** 🧠 *Smart JSON Structure*\n\n`;
        md += `| Tijd | Activiteit | Lucide Icoon |\n`;
        md += `| :--- | :--- | :--- |\n`;
        meta.day_schedule.items.forEach((item: any) => {
          const emoji = getEmojiForIcon(item.icon);
          md += `| ${item.time} | ${item.label} | ${emoji} (\`${item.icon || '📝'}\`) |\n`;
        });
      } else {
        md += `💡 **Database Status:** 📄 *Legacy Text Format*\n\n`;
        md += `${meta.day_schedule}\n`;
      }
    } else {
      md += `❌ Geen standaard dagindeling\n`;
    }
    md += `\n`;
    
    md += `### 🎥 Media Assets (Hard Handshake)\n`;
    
    // Featured Image from media_id (Hard Handshake)
    if (w.featured_image_path) {
      const storageBase = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/';
      md += `- **FEATURED IMAGE:** [${w.featured_image_path.split('/').pop()}](${storageBase}${w.featured_image_path}) (Source: \`media_id\`)\n`;
    } else {
      md += `- **FEATURED IMAGE:** ❌ Geen afbeelding gekoppeld via \`media_id\`\n`;
    }

    const workshopMedia = allMedia.filter((m: any) => m.workshop_id === w.id);
    if (workshopMedia.length > 0) {
      workshopMedia.forEach((m: any) => {
        const storageBase = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/';
        const url = `${storageBase}${m.file_path}`;
        md += `- **${m.media_type.toUpperCase()}:** [${m.file_name}](${url}) (ID: \`${m.id}\`, World: \`${m.world_id}\`)\n`;
      });
    } else {
      md += `❌ Geen media gekoppeld via media-tabel\n`;
    }
    md += `\n`;
    
    md += `### ❓ Veelgestelde Vragen (FAQ)\n`;
    const specificFaqs = allFaqs.filter((f: any) => f.workshop_id === w.id);
    const generalFaqs = allFaqs.filter((f: any) => f.workshop_id === null && f.target_entity_type === 'workshop');
    
    if (specificFaqs.length > 0) {
      md += `#### 🤝 Workshop Specifiek (Hard Handshake)\n`;
      specificFaqs.forEach((f: any) => {
        md += `**V:** ${f.question_nl}\n\n**A:** ${f.answer_nl}\n\n`;
      });
    }
    
    if (generalFaqs.length > 0) {
      md += `#### 🌐 Algemeen (Workshop World)\n`;
      generalFaqs.forEach((f: any) => {
        md += `**V:** ${f.question_nl}\n\n**A:** ${f.answer_nl}\n\n`;
      });
    }
    md += `\n`;

    md += `### 👨‍🏫 Instructors\n`;
    const workshopInstructors = (allInstructors as any[]).filter(i => 
      (instructorMappings as any[]).some(m => m.workshop_id === w.id && m.instructor_id === i.id)
    );

    if (workshopInstructors.length > 0) {
      workshopInstructors.forEach((i: any) => {
        md += `#### 👤 ${i.name} (ID: \`${i.id}\`)\n`;
        md += `- **Tagline:** ${i.tagline || '❌'}\n`;
        md += `- **Slug:** \`${i.slug || '❌'}\`\n`;
        if (i.photo_id) {
          const storageBase = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/';
          const instructorMedia = (allMedia as any[]).find(m => m.id === i.photo_id);
          if (instructorMedia) {
            const photoUrl = `${storageBase}${instructorMedia.file_path}`;
            md += `- **Foto ID:** \`${i.photo_id}\` (Gekoppeld via \`photo_id\`)  \n`;
            md += `  - **URL:** [${photoUrl}](${photoUrl})\n`;
          } else {
            md += `- **Foto ID:** \`${i.photo_id}\` (Gekoppeld via \`photo_id\`) - ⚠️ Media record niet gevonden in \`allMedia\`\n`;
          }
        }
        md += `\n**Bio:**\n${i.bio || '❌'}\n\n`;
      });
    } else {
      md += `❌ Geen instructeurs gekoppeld\n\n`;
    }

    md += `### 📍 Locaties\n`;
    const workshopLocations = (allLocations as any[]).filter(l => 
      (locationMappings as any[]).some(m => m.workshop_id === w.id && m.location_id === l.id)
    );

    if (workshopLocations.length > 0) {
      workshopLocations.forEach((l: any) => {
        md += `#### 🏠 ${l.name} (ID: \`${l.id}\`)\n`;
        md += `- **Adres:** ${[l.address, l.zip, l.city].filter(Boolean).join(', ') || '❌'}\n`;
        if (l.map_url) md += `- **Google Maps:** [Link](${l.map_url})\n`;
        if (l.description) md += `\n**Beschrijving:**\n${l.description}\n`;
        md += `\n`;
      });
    } else {
      md += `❌ Geen locaties gekoppeld via edities\n\n`;
    }

    md += `### 🗓️ Geplande & Vorige Edities\n`;
    const validEditions = (w.editions || []).filter((e: any) => e.id !== null);
    if (validEditions.length > 0) {
      validEditions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      validEditions.forEach((e: any) => {
        const vaultLink = vaultMap[e.id];
        const timeStr = (e.start_time && e.end_time) ? ` | 🕒 ${e.start_time.substring(0, 5)} - ${e.end_time.substring(0, 5)}` : '';
        md += `#### 📍 Editie: ${e.date ? new Date(e.date).toLocaleDateString('nl-BE') : '❌'} (${e.location_name || '❌'})${timeStr}\n`;
        md += `- **ID:** \`${e.id}\` | **Status:** \`${e.status_label}\` (ID: \`${e.status_id}\`)  \n`;
        
        if (vaultLink) {
          md += `- **📂 Workshop Assets:** [${vaultLink.label_nl}](${vaultLink.vault_folder_path}) (Hard Handshake)\n`;
        } else if (w.has_demo_bundle) {
          md += `- **📂 Workshop Assets:** ⏳ *Nog niet geüpload voor deze editie*\n`;
        }

        md += `- **Programma:** ${e.program ? '🧠 *Smart JSON Programma aanwezig*' : '🧩 Gebruikt standaard blueprint'}\n`;
        
        if (e.program && e.program.type === 'structured') {
          md += `\n| Tijd | Activiteit | Lucide Icoon |\n`;
          md += `| :--- | :--- | :--- |\n`;
          e.program.items.forEach((item: any) => {
            const emoji = getEmojiForIcon(item.icon);
            md += `| ${item.time} | ${item.label} | ${emoji} (\`${item.icon || '📝'}\`) |\n`;
          });
          md += `\n`;
        }

        if (e.total_net) {
          md += `- **Financieel Overzicht:** 💰 Netto: €${Number(e.total_net).toFixed(2)} | Totaal: €${Number(e.total_gross).toFixed(2)}\n`;
        }

        if (e.participants && e.participants.length > 0) {
          md += `- **Deelnemers (${e.participants.length}):** 🔍 *Bron: view_workshop_participants*\n\n`;
          md += `| Naam | E-mail | Telefoon | Info | Status | Koper | Betaald (Net) |\n`;
          md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
          e.participants.forEach((p: any) => {
            const info = [p.age ? `${p.age}j` : null, p.profession, p.experience].filter(Boolean).join(' / ') || '-';
            const status = p.interest_status ? `🎯 ${p.interest_status}` : '👤 Deelnemer';
            const buyer = p.is_different_from_buyer ? `⚠️ Anders<br/>(${p.buyer_name})` : '✅ Zelfde';
            const paid = p.amount_net ? `€${Number(p.amount_net).toFixed(2)}` : '€0.00';
            md += `| ${p.name || 'Onbekend'} | ${p.email || '-'} | ${p.phone || '-'} | ${info} | ${status} | ${buyer} | ${paid} |\n`;
          });
        } else {
          md += `- **Deelnemers:** ❌ Geen deelnemers gevonden\n`;
        }
        md += `\n`;
      });
    } else {
      md += `📣 **Lead-Gen Modus**: Geen edities gepland.\n`;
    }
    md += `\n---\n\n`;
  });

  fs.writeFileSync('3-WETTEN/docs/SUPABASE_WORKSHOP_CONTENT.md', md);
  console.log('✅ SUPABASE_WORKSHOP_CONTENT.md updated with Assets & Journeys!');
  process.exit(0);
}

generateMD().catch(err => { console.error('❌ MD Generation Failed:', err); process.exit(1); });
