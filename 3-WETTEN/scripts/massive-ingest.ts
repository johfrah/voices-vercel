import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TARGET_LANGS = ['en', 'fr', 'de', 'es', 'pt', 'it'];

async function translate(text, targetLang, context) {
    if (!text || text === '...') return null;
    
    // Intelligent Skip: Names, proper nouns, single words that shouldn't change
    const isSingleWord = text.trim().split(/\s+/).length === 1;
    const isLikelyName = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(text.trim());
    
    if (isSingleWord && isLikelyName) {
        console.log(`[Skip] Likely proper noun: ${text}`);
        return text;
    }

    try {
        const prompt = `
            You are a senior translator for Voices.be (a high-end voice-over agency).
            Translate the following Dutch text to ${targetLang.toUpperCase()}.
            CONTEXT: ${context || 'General UI'}
            TEXT: "${text}"
            
            RULES:
            1. Maintain the professional yet warm tone of Voices.
            2. Do NOT translate proper names, brand names (Voices, Sunlapse, etc.) or file names.
            3. Return ONLY the translated text. No quotes.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
        });

        return response.choices[0].message.content.trim().replace(/^"|"$/g, '');
    } catch (err) {
        console.error(`Translation error for ${targetLang}:`, err.message);
        return null;
    }
}

async function run() {
    console.log('🚀 Starting Massive Intelligent Ingest...');

    // 1. Get all registry items except internal knowledge
    const { data: items, error: regErr } = await supabase
        .from('translation_registry')
        .select('*')
        .not('string_hash', 'ilike', 'knowledge.%')
        .order('last_seen', { ascending: false });

    if (regErr) {
        console.error('Failed to fetch registry:', regErr);
        return;
    }

    console.log(`Found ${items.length} registry items to check.`);

    // 2. Get existing translations to skip already done ones
    const { data: existing, error: transErr } = await supabase
        .from('translations')
        .select('translation_key, lang');

    const doneSet = new Set((existing || []).map(t => `${t.translation_key}:${t.lang}`));

    let processed = 0;
    let created = 0;

    for (const item of items) {
        for (const lang of TARGET_LANGS) {
            const key = `${item.string_hash}:${lang}`;
            if (doneSet.has(key)) continue;

            console.log(`[${++processed}] Translating ${item.string_hash} to ${lang}...`);
            const result = await translate(item.original_text, lang, item.context);

            if (result) {
                const { error: upsertErr } = await supabase
                    .from('translations')
                    .upsert({
                        translation_key: item.string_hash,
                        lang: lang,
                        original_text: item.original_text,
                        translated_text: result,
                        status: 'active',
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'translation_key, lang' });

                if (!upsertErr) created++;
            }
        }
        
        if (processed % 50 === 0) {
            console.log(`--- Progress: ${processed} checked, ${created} new translations created ---`);
        }
    }

    console.log(`✅ Finished! Created ${created} new translations.`);
}

run();
