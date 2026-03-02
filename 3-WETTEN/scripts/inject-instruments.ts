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
  console.log('🚀 STARTING FULL 9-WORLD NUCLEAR INJECTION...');

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
          type: 'HowItWorksInstrument',
          settings: {
            data: {
              title: 'Hoe het werkt',
              subtitle: 'In 3 eenvoudige stappen naar je perfecte opname.',
              steps: [
                { title: 'Kies je stem', description: 'Luister naar demo\'s en selecteer je favoriet.' },
                { title: 'Briefing & Script', description: 'Upload je tekst en geef regie-aanwijzingen.' },
                { title: 'Ontvang je audio', description: 'Binnen 24 uur geleverd in topkwaliteit.' }
              ]
            }
          }
        },
        {
          type: 'ReviewsInstrument',
          settings: {
            data: {
              title: 'Wat onze klanten zeggen',
              subtitle: 'Echte ervaringen van professionals die voor Voices kozen.',
              category: 'agency'
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
      slug: 'johfrai',
      title: 'Johfrai World',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'De Toekomst van Stem',
              highlight: 'Toekomst',
              subtitle: 'Hybride audio-opnames waar mens en AI samenkomen. Lead door Voicy.',
              cta: { text: 'Ontdek AI Stemmen', href: '#ai' }
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Mens x Machine',
              items: [
                { title: 'AI Cloning', description: 'Je eigen stem, maar dan overal inzetbaar.', icon: 'Cpu' },
                { title: 'Hybride Regie', description: 'De perfecte mix van emotie en snelheid.', icon: 'Zap' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'partners',
      title: 'Partner World',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Groei met Voices',
              highlight: 'Groei',
              subtitle: 'Word onderdeel van ons ecosysteem. Voor resellers, agencies en integraties.',
              cta: { text: 'Partner worden', href: '#join' }
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Partner Voordelen',
              items: [
                { title: 'White-label', description: 'Onze stemmen onder jouw eigen merk.', icon: 'Shield' },
                { title: 'API Toegang', description: 'Directe integratie in jouw workflow.', icon: 'Code' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'freelance',
      title: 'Freelance World',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Het Vakmanschap',
              highlight: 'Vakmanschap',
              subtitle: 'Voor de professionele stemacteur. Beheerd door Chris.',
              cta: { text: 'Meld je aan', href: '/signup-voice' }
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Onze Standaard',
              items: [
                { title: 'Kwaliteit', description: 'Alleen de hoogste technische standaarden.', icon: 'CheckCircle' },
                { title: 'Community', description: 'Deel kennis met de beste in het vak.', icon: 'Users' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'portfolio',
      title: 'Portfolio World',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Showcase van Talent',
              highlight: 'Talent',
              subtitle: 'Bekijk onze beste producties en commissies. Lead door Laya.',
              cta: { text: 'Bekijk cases', href: '#cases' }
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Uitgelicht Werk',
              items: [
                { title: 'High-end Video', description: 'Cinematische voice-over producties.', icon: 'Film' },
                { title: 'Audio Branding', description: 'De identiteit van grote merken.', icon: 'Music' }
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
              subtitle: 'Fysieke workshops en masterclasses onder leiding van Berny.',
              cta: { text: 'Bekijk workshops', href: '#workshops' }
            }
          }
        },
        {
          type: 'WorkshopCarousel',
          settings: {
            data: {
              title: 'Onze Workshops',
              subtitle: 'Kies de workshop die bij jouw ambitie past.'
            }
          }
        },
        {
          type: 'WorkshopCalendar',
          settings: {
            data: {
              title: 'Agenda',
              subtitle: 'Plan je volgende stap in je stemcarrière.'
            }
          }
        },
        {
          type: 'ReviewsInstrument',
          settings: {
            data: {
              title: 'Ervaringen van Deelnemers',
              subtitle: 'Lees hoe anderen hun stem vonden in onze studio.',
              category: 'studio'
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Vakmanschap',
              items: [
                { title: 'Berny', description: 'Studio & Academy Lead.', icon: 'User' },
                { title: 'De Studio', description: 'High-end opnamefaciliteiten.', icon: 'Mic2' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'academy',
      title: 'Voices Academy',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Voices Academy',
              highlight: 'Academy',
              subtitle: 'Online leertrajecten voor wie op eigen tempo wil groeien als stemacteur.',
              cta: { text: 'Ontdek cursussen', href: '#cursussen' }
            }
          }
        },
        {
          type: 'HowItWorksInstrument',
          settings: {
            data: {
              title: 'Jouw Leertraject',
              subtitle: 'Stap voor stap naar een professionele stemcarrière.',
              steps: [
                { title: 'Start de basis', description: 'Leer de fundamenten van stemgebruik.' },
                { title: 'Oefen in de praktijk', description: 'Krijg feedback op je opnames.' },
                { title: 'Bouw je portfolio', description: 'Maak je eerste professionele demo.' }
              ]
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Het Aanbod',
              items: [
                { title: 'De Basis', description: '12 Lessen over video & audio technieken.', icon: 'BookOpen' },
                { title: 'De Techniek', description: '8 Lessen over high-end studio setups.', icon: 'Settings' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'ademing',
      title: 'Ademing',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Vind je rust in de chaos',
              highlight: 'rust',
              subtitle: 'Begeleide meditaties en ademwerk voor sprekers en creatieven.',
              cta: { text: 'Start sessie', href: '#start' }
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'De Elementen',
              items: [
                { title: 'Aarde', description: 'Focus & Kracht (10 min)', icon: 'Mountain' },
                { title: 'Lucht', description: 'Ruimte & Vrijheid (15 min)', icon: 'Wind' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'artist/youssef',
      title: 'Youssef Zaki | Voices Artist',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Youssef Zaki',
              highlight: 'Youssef',
              subtitle: 'Help je mee om mijn eerste EP onafhankelijk te releasen?',
              cta: { text: 'Support de release', href: '#support' }
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'De Weg naar Agora',
              items: [
                { title: 'De Docu', description: 'Bekijk de weg van The Voice naar eigen muziek.', icon: 'Play' },
                { title: 'De Muziek', description: 'Luister naar de eerste previews.', icon: 'Music' }
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
              subtitle: 'Een ecosysteem van 9 harmonieuze werelden.',
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
                { title: 'Bob', description: 'Grand Visionary.', icon: 'Zap' },
                { title: 'Mark', description: 'Marketing & Dramaturgie.', icon: 'Type' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'studio/contact',
      title: 'Contact | Voices Studio',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Contacteer de Studio',
              highlight: 'Studio',
              subtitle: 'Heb je een vraag over een workshop of opname? Berny helpt je verder.',
              cta: { text: 'Stuur een bericht', href: '#form' }
            }
          }
        },
        {
          type: 'WorkshopInterestForm',
          settings: {
            data: {
              title: 'Stuur Berny een bericht',
              subtitle: 'We reageren doorgaans binnen 2 uur.'
            }
          }
        }
      ]
    },
    {
      slug: 'studio/faq',
      title: 'Veelgestelde Vragen | Voices Studio',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Studio FAQ',
              highlight: 'FAQ',
              subtitle: 'Alles wat je moet weten over onze workshops en faciliteiten.'
            }
          }
        },
        {
          type: 'AccordionInstrument',
          settings: {
            data: {
              title: 'Vragen over Workshops',
              category: 'studio'
            }
          }
        }
      ]
    },
    {
      slug: 'academy/contact',
      title: 'Contact | Voices Academy',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Contacteer de Academy',
              highlight: 'Academy',
              subtitle: 'Vragen over onze online leertrajecten of coaching? We helpen je graag verder.',
              cta: { text: 'Stuur een bericht', href: '#form' }
            }
          }
        },
        {
          type: 'WorkshopInterestForm',
          settings: {
            data: {
              title: 'Stuur ons een bericht',
              subtitle: 'Vragen over cursussen of coaching.'
            }
          }
        }
      ]
    },
    {
      slug: 'academy/faq',
      title: 'Veelgestelde Vragen | Voices Academy',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Academy FAQ',
              highlight: 'FAQ',
              subtitle: 'Alles wat je moet weten over onze online cursussen en certificering.'
            }
          }
        },
        {
          type: 'AccordionInstrument',
          settings: {
            data: {
              title: 'Vragen over de Academy',
              category: 'academy'
            }
          }
        }
      ]
    },
    {
      slug: 'ademing/contact',
      title: 'Contact | Ademing',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Contacteer Ademing',
              highlight: 'Ademing',
              subtitle: 'Een vraag over een sessie of track? Mat staat voor je klaar.',
              cta: { text: 'Stuur een bericht', href: '#form' }
            }
          }
        },
        {
          type: 'WorkshopInterestForm',
          settings: {
            data: {
              title: 'Stuur ons een bericht',
              subtitle: 'Rust begint bij een goed gesprek.'
            }
          }
        }
      ]
    },
    {
      slug: 'ademing/faq',
      title: 'Veelgestelde Vragen | Ademing',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Ademing FAQ',
              highlight: 'FAQ',
              subtitle: 'Alles over meditaties, tracks en gebruik van het platform.'
            }
          }
        },
        {
          type: 'AccordionInstrument',
          settings: {
            data: {
              title: 'Vragen over Ademing',
              category: 'ademing'
            }
          }
        }
      ]
    },
    {
      slug: 'johfrai/contact',
      title: 'Contact | Johfrai AI World',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Contacteer Johfrai',
              highlight: 'Johfrai',
              subtitle: 'Vragen over AI cloning of hybride audio? Voicy helpt je verder.',
              cta: { text: 'Stuur een bericht', href: '#form' }
            }
          }
        },
        {
          type: 'WorkshopInterestForm',
          settings: {
            data: {
              title: 'Stuur Voicy een bericht',
              subtitle: 'De toekomst van stem is hier.'
            }
          }
        }
      ]
    },
    {
      slug: 'johfrai/faq',
      title: 'Veelgestelde Vragen | Johfrai AI World',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Johfrai FAQ',
              highlight: 'FAQ',
              subtitle: 'Alles wat je moet weten over AI stemmen en technologie.'
            }
          }
        },
        {
          type: 'AccordionInstrument',
          settings: {
            data: {
              title: 'Vragen over Johfrai AI',
              category: 'johfrai'
            }
          }
        }
      ]
    },
    {
      slug: 'artist/youssef/contact',
      title: 'Contact | Youssef Zaki',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Contacteer Youssef',
              highlight: 'Youssef',
              subtitle: 'Voor boekingen, samenwerkingen of support.',
              cta: { text: 'Stuur een bericht', href: 'mailto:info@voices.be' }
            }
          }
        }
      ]
    },
    {
      slug: 'contact',
      title: 'Contact',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Laten we praten',
              highlight: 'Contact',
              subtitle: 'Heb je een vraag? Mat en de andere agents staan voor je klaar.',
              cta: { text: 'Stuur een bericht', href: '#form' }
            }
          }
        },
        {
          type: 'WorkshopInterestForm',
          settings: {
            data: {
              title: 'Stuur ons een bericht',
              subtitle: 'We reageren doorgaans binnen 2 uur.'
            }
          }
        },
        {
          type: 'BentoShowcase',
          settings: {
            data: {
              title: 'Contact Opties',
              items: [
                { title: 'Email', description: 'info@voices.be', icon: 'Mail' },
                { title: 'Telefoon', description: '+32 (0) ...', icon: 'Phone' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'terms',
      title: 'Algemene Voorwaarden',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Algemene Voorwaarden',
              highlight: 'Voorwaarden',
              subtitle: 'De juridische spelregels van ons ecosysteem.'
            }
          }
        },
        {
          type: 'AccordionInstrument',
          settings: {
            data: {
              title: 'Onze Voorwaarden',
              items: [
                { title: '1. Definities', content: 'In deze voorwaarden wordt verstaan onder...' },
                { title: '2. Toepasselijkheid', content: 'Deze voorwaarden zijn van toepassing op...' }
              ]
            }
          }
        }
      ]
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      blocks: [
        {
          type: 'HeroInstrument',
          settings: {
            data: {
              title: 'Privacy Policy',
              highlight: 'Privacy',
              subtitle: 'Hoe we met jouw data omgaan (Spoiler: heel voorzichtig).'
            }
          }
        },
        {
          type: 'AccordionInstrument',
          settings: {
            data: {
              title: 'Jouw Data',
              items: [
                { title: '1. Gegevensverzameling', content: 'We verzamelen alleen wat strikt noodzakelijk is...' },
                { title: '2. Gebruik van gegevens', content: 'Jouw data wordt gebruikt voor...' }
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

  console.log('🏁 FULL 9-WORLD INJECTION COMPLETED.');
}

inject();
