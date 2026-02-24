import postgres from 'postgres';
import OpenAI from 'openai';

// --- CONFIGURATION ---
const DATABASE_URL = process.env.DATABASE_URL!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const TARGET_LANGUAGES = ['en-gb', 'fr-fr', 'de-de', 'es-es', 'pt-pt'];

const sql = postgres(DATABASE_URL, { ssl: 'require' });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- SLOP FILTER ---
const forbiddenPhrases = [
  'tijd nodig om na te denken', 'probeer je het zo nog eens', 'voldoende context',
  'meer informatie', 'langere tekst', 'niet compleet', 'accuraat', 'zou je',
  'het lijkt erop', 'ik kan je niet helpen', 'als ai-model', 'sorry'
];

function isSlop(text: string, targetLang: string, sourceText: string): boolean {
  if (!text) return true;
  const lowerText = text.toLowerCase();
  if (forbiddenPhrases.some(phrase => lowerText.includes(phrase))) return true;
  const dutchIndicators = [' het ', ' de ', ' een ', ' is ', ' zijn ', ' met ', ' voor '];
  if (!targetLang.startsWith('nl')) {
    const hasDutchWords = dutchIndicators.filter(word => lowerText.includes(word)).length >= 2;
    if (hasDutchWords && lowerText !== sourceText.toLowerCase()) return true;
  }
  if (text.length > sourceText.length * 4 && text.length > 100) return true;
  return false;
}

// --- INTELLIGENCE ---
async function getMarketDNA(lang: string): Promise<string> {
  try {
    const shortLang = lang.split('-')[0];
    const records = await sql`
      SELECT content FROM system_knowledge 
      WHERE slug = ${`market-dna-${shortLang}`} OR slug = ${`industry-glossary-${shortLang}`}
    `;
    return records.map(r => r.content).join("\n\n");
  } catch (e) {
    return "";
  }
}

async function translate(text: string, lang: string, context: string, dna: string): Promise<string> {
  let contextHint = context || 'Algemene website tekst';
  // Enhanced context logic
  if (context.toLowerCase().includes('bio')) contextHint = `Dit is een bio van een stemacteur. Houd het warm en professioneel.`;
  if (context.toLowerCase().includes('faq')) contextHint = `Dit is een FAQ antwoord. Wees helder en behulpzaam.`;
  
  const prompt = `
    Je bent de senior vertaler voor Voices.be, een high-end castingbureau voor stemmen.
    Vertaal de volgende tekst van het Nederlands naar het ${lang}.
    
    MARKET DNA & RULES:
    ${dna}
    
    CONTEXT:
    ${contextHint}
    
    TONE OF VOICE:
    Warm, gelijkwaardig, vakmanschap, nuchter. Geen AI-bingo woorden (zoals 'ontdek', 'passie', 'ervaar').
    
    STRICT OUTPUT RULES:
    - Antwoord UITSLUITEND met de vertaalde tekst.
    - Geen inleiding zoals "De vertaling is:".
    - Geen herhaling van de brontekst.
    - Geen aanhalingstekens rond de vertaling.
    - Behoud de betekenis en de Voices-vibe.
    
    TEKST:
    "${text}"
    
    VERTALING:
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return (response.choices[0]?.message?.content || '').trim().replace(/^"|"$/g, '');
}

// --- MAIN LOOP ---
async function run() {
  console.log('🚀 NUCLEAR HEAL 2026 STARTED');
  
  const registry = await sql`SELECT string_hash, original_text, context FROM translation_registry`;
  console.log(`📦 Registry loaded: ${registry.length} items.`);

  for (const lang of TARGET_LANGUAGES) {
    console.log(`\n🌍 PROCESSING LANGUAGE: ${lang.toUpperCase()}`);
    const dna = await getMarketDNA(lang);
    
    const existing = await sql`SELECT translation_key FROM translations WHERE lang = ${lang}`;
    const existingKeys = new Set(existing.map(r => r.translation_key));
    
    const missing = registry.filter(r => !existingKeys.has(r.string_hash));
    console.log(`- Missing: ${missing.length} items.`);

    for (let i = 0; i < missing.length; i++) {
      const item = missing[i];
      try {
        const translated = await translate(item.original_text, lang, item.context || '', dna);
        
        if (isSlop(translated, lang, item.original_text)) {
          console.warn(`  ⚠️ Slop detected for ${item.string_hash}, skipping.`);
          continue;
        }

        await sql`
          INSERT INTO translations (translation_key, lang, original_text, translated_text, status, updated_at)
          VALUES (${item.string_hash}, ${lang}, ${item.original_text}, ${translated}, 'active', NOW())
          ON CONFLICT (translation_key, lang) DO UPDATE SET 
            translated_text = EXCLUDED.translated_text,
            updated_at = NOW()
        `;

        if ((i + 1) % 10 === 0 || i === missing.length - 1) {
          console.log(`  ✅ Progress [${lang}]: ${i + 1}/${missing.length}`);
        }
      } catch (err: any) {
        console.error(`  ❌ Error translating ${item.string_hash}:`, err.message);
        // Wait a bit if it's a rate limit
        if (err.message.includes('429')) await new Promise(r => setTimeout(r, 5000));
      }
    }
  }

  console.log('\n🏁 NUCLEAR HEAL COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

run().catch(err => {
  console.error('💥 CRITICAL ERROR:', err);
  process.exit(1);
});
