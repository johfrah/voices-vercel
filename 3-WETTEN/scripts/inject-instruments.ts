import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Zoek naar de .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ .env.local not found at:', envPath);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key missing in env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inject() {
  console.log('🚀 STARTING INSTRUMENT INJECTION...');

  const pages = [
    {
      slug: 'agency',
      title: 'Voices Agency',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Vind de stem voor jouw verhaal',
              highlight: 'stem',
              subtitle: 'Van bedrijfsfilm tot commercial. Ontdek 500+ professionele stemacteurs.',
              cta: { text: 'Ontdek stemmen', href: '/agency' }
            }
          }
        },
        {
          type: 'PricingInstrument',
          settings: {
            data: {
              title: 'Bereken direct je tarief',
              subtitle: 'Transparante prijzen zonder verrassingen.'
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Waarom Voices?',
              items: [
                { title: 'Snelheid', description: 'Levering binnen 24 uur.', icon: 'Zap' },
                { title: 'Kwaliteit', description: 'Alleen de beste pro\'s.', icon: 'Star' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'tarieven',
      title: 'Tarieven & Pakketten',
      blocks: [
        {
          type: 'PricingInstrument',
          settings: {
            data: {
              title: 'Onze Tarieven',
              subtitle: 'Kies het pakket dat bij je past.'
            }
          }
        },
        {
          type: 'AccordionInstrument',
          settings: {
            data: {
              title: 'Veelgestelde vragen',
              items: [
                { question: 'Hoe snel wordt er geleverd?', answer: 'Meestal binnen 24 uur.' },
                { question: 'Zijn de prijzen inclusief BTW?', answer: 'Nee, alle prijzen zijn exclusief BTW.' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'studio',
      title: 'Voices Studio',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Meester je Stem',
              highlight: 'stem',
              subtitle: 'Fysieke workshops en masterclasses voor de stem van morgen. Onder leiding van Berny.',
              cta: { text: 'Bekijk workshops', href: '#workshops' }
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Vakmanschap in de Studio',
              items: [
                { title: 'Berny', description: 'Studio & Academy Lead. Bewaker van het vakmanschap.', icon: 'User' },
                { title: 'De Studio', description: 'High-end opnamefaciliteiten in het hart van de actie.', icon: 'Mic2' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'over-ons',
      title: 'Het Verhaal van Voices',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Het Theater van de Stem',
              highlight: 'Theater',
              subtitle: 'Een ecosysteem van 9 harmonieuze werelden, georkestreerd door de Harmonieraad.',
              cta: { text: 'Ontdek onze visie', href: '#visie' }
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'De Harmonieraad',
              items: [
                { title: 'Bob', description: 'Grand Visionary. De oervader van het ecosysteem.', icon: 'Zap' },
                { title: 'Mark', description: 'Marketing & Dramaturgie. Bewaker van de Tone of Voice.', icon: 'Type' }
              ]
            }
          }
        }
      ]
    }
  ];

  for (const pageData of pages) {
    console.log(`📄 Processing page: ${pageData.slug}`);
    
    // 1. Get or Create Page
    let { data: page } = await supabase
      .from('content_articles')
      .select('id')
      .eq('slug', pageData.slug)
      .maybeSingle();

    if (!page) {
      console.log(`➕ Creating new page: ${pageData.slug}`);
      const { data: newPage, error: createError } = await supabase
        .from('content_articles')
        .insert({ slug: pageData.slug, title: pageData.title, status: 'publish' })
        .select('id')
        .single();
      
      if (createError) {
        console.error(`❌ Error creating page ${pageData.slug}:`, createError.message);
        continue;
      }
      page = newPage;
    }

    if (page) {
      // 2. Clear existing blocks
      await supabase.from('content_blocks').delete().eq('article_id', page.id);

      // 3. Insert new blocks
      const { error: insertError } = await supabase.from('content_blocks').insert(
        pageData.blocks.map((b, idx) => ({
          article_id: page.id,
          type: b.type,
          settings: b.settings,
          display_order: idx,
          is_manually_edited: true
        }))
      );

      if (insertError) {
        console.error(`❌ Error inserting blocks for ${pageData.slug}:`, insertError.message);
      } else {
        console.log(`✅ Blocks injected for ${pageData.slug}`);
      }
    }
  }

  console.log('🏁 INJECTION COMPLETED.');
}

inject();
