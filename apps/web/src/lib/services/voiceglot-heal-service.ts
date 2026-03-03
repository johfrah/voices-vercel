import { SlopFilter } from '@/lib/engines/slop-filter';
import { createClient } from '@supabase/supabase-js';
import { GeminiService } from './gemini-service';

export const VOICEGLOT_TARGET_LANGUAGES = ['en-gb', 'fr-be', 'fr-fr', 'de-de', 'es-es', 'pt-pt', 'it-it'] as const;

type TargetLocale = typeof VOICEGLOT_TARGET_LANGUAGES[number];

type RegistryItem = {
  string_hash: string;
  original_text: string;
  context?: string | null;
  last_seen?: string | null;
};

type ExistingTranslation = {
  translation_key: string;
  lang: string;
  translated_text?: string | null;
  status?: string | null;
  lang_id?: number | null;
};

type CoverageRow = {
  lang: string;
  active_count: number;
  coverage_pct: number;
  pending_count: number;
};

export type VoiceglotHealBatchResult = {
  success: boolean;
  processed_count: number;
  healed_count: number;
  copied_count: number;
  failed_count: number;
  pending_total: number;
  batch_size: number;
  target_languages: string[];
  finished: boolean;
};

export type VoiceglotCoverageSnapshot = {
  total_registry: number;
  coverage: CoverageRow[];
  updated_at: string;
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials for Voiceglot service');
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function fetchAllRegistryItems(limit = 10000): Promise<RegistryItem[]> {
  const supabase = getSupabaseAdmin();
  const pageSize = 1000;
  let offset = 0;
  const rows: RegistryItem[] = [];

  while (offset < limit) {
    const { data, error } = await supabase
      .from('translation_registry')
      .select('string_hash, original_text, context, last_seen')
      .order('last_seen', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...(data as RegistryItem[]));
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

async function fetchExistingTranslations(locales: readonly string[]): Promise<ExistingTranslation[]> {
  if (locales.length === 0) return [];
  const supabase = getSupabaseAdmin();
  const pageSize = 1000;
  let offset = 0;
  const rows: ExistingTranslation[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('translations')
      .select('translation_key, lang, translated_text, status, lang_id')
      .in('lang', [...locales])
      .order('translation_key', { ascending: true })
      .order('lang', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...(data as ExistingTranslation[]));
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

async function fetchLanguageIds(locales: readonly string[]): Promise<Map<string, number>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('languages')
    .select('id, code')
    .in('code', [...locales]);
  if (error) throw error;

  const langMap = new Map<string, number>();
  (data || []).forEach((row: any) => {
    if (!row?.code || !row?.id) return;
    langMap.set(String(row.code).toLowerCase(), Number(row.id));
  });
  return langMap;
}

function hasActiveTranslation(row?: ExistingTranslation | null): boolean {
  if (!row) return false;
  const text = (row.translated_text || '').trim();
  if (!text || text === '...') return false;
  return (row.status || 'active') === 'active';
}

function normalizeTranslatedText(text: string): string {
  return text.trim().replace(/^"|"$/g, '');
}

export async function getVoiceglotCoverageSnapshot(
  targetLanguages: readonly string[] = VOICEGLOT_TARGET_LANGUAGES,
): Promise<VoiceglotCoverageSnapshot> {
  const registryItems = await fetchAllRegistryItems();
  const keys = registryItems.map((item) => item.string_hash).filter(Boolean);
  const existing = await fetchExistingTranslations(targetLanguages);
  const map = new Map<string, ExistingTranslation>();
  existing.forEach((row) => {
    const composite = `${row.translation_key}::${String(row.lang).toLowerCase()}`;
    map.set(composite, row);
  });

  const totalRegistry = keys.length;
  const coverage = targetLanguages.map((lang) => {
    const locale = String(lang).toLowerCase();
    let activeCount = 0;
    let pendingCount = 0;

    for (const key of keys) {
      const row = map.get(`${key}::${locale}`);
      if (hasActiveTranslation(row)) {
        activeCount += 1;
      } else {
        pendingCount += 1;
      }
    }

    const pct = totalRegistry > 0 ? Number(((activeCount / totalRegistry) * 100).toFixed(1)) : 0;
    return {
      lang: locale,
      active_count: activeCount,
      coverage_pct: pct,
      pending_count: pendingCount,
    };
  });

  return {
    total_registry: totalRegistry,
    coverage,
    updated_at: new Date().toISOString(),
  };
}

export async function runVoiceglotHealBatch(options?: {
  batchSize?: number;
  targetLanguages?: readonly string[];
}): Promise<VoiceglotHealBatchResult> {
  const targetLanguages = (options?.targetLanguages || VOICEGLOT_TARGET_LANGUAGES).map((value) => String(value).toLowerCase());
  const batchSize = Math.max(1, Math.min(options?.batchSize || 50, 500));

  const supabase = getSupabaseAdmin();
  const registryItems = await fetchAllRegistryItems();
  const registryMap = new Map<string, RegistryItem>();
  registryItems.forEach((item) => {
    if (item.string_hash) registryMap.set(item.string_hash, item);
  });

  const keys = Array.from(registryMap.keys());
  const existingRows = await fetchExistingTranslations(targetLanguages);
  const translationMap = new Map<string, ExistingTranslation>();
  existingRows.forEach((row) => {
    const composite = `${row.translation_key}::${String(row.lang).toLowerCase()}`;
    translationMap.set(composite, row);
  });

  const pendingQueue: Array<{ key: string; lang: string; item: RegistryItem }> = [];
  for (const key of keys) {
    const item = registryMap.get(key);
    if (!item) continue;
    for (const lang of targetLanguages) {
      const existing = translationMap.get(`${key}::${lang}`);
      if (!hasActiveTranslation(existing)) {
        pendingQueue.push({ key, lang, item });
      }
    }
  }

  if (pendingQueue.length === 0) {
    return {
      success: true,
      processed_count: 0,
      healed_count: 0,
      copied_count: 0,
      failed_count: 0,
      pending_total: 0,
      batch_size: batchSize,
      target_languages: targetLanguages,
      finished: true,
    };
  }

  const toProcess = pendingQueue.slice(0, batchSize);
  const langIds = await fetchLanguageIds(targetLanguages);
  const gemini = GeminiService.getInstance();
  const dnaCache: Record<string, string> = {};
  for (const lang of targetLanguages) {
    dnaCache[lang] = await gemini.getMarketDNA(lang);
  }

  let healed = 0;
  let copied = 0;
  let failed = 0;

  for (const entry of toProcess) {
    const sourceText = entry.item.original_text || '';
    if (!sourceText) {
      failed += 1;
      continue;
    }

    const composite = `${entry.key}::${entry.lang}`;
    const langId = langIds.get(entry.lang) || null;

    // Fast-track: use fr-be translation as source for fr-fr when available.
    if (entry.lang === 'fr-fr') {
      const frBe = translationMap.get(`${entry.key}::fr-be`);
      if (hasActiveTranslation(frBe)) {
        const copyText = normalizeTranslatedText(frBe!.translated_text || '');
        await supabase
          .from('translations')
          .upsert(
            {
              translation_key: entry.key,
              lang: entry.lang,
              lang_id: langId,
              original_text: sourceText,
              translated_text: copyText,
              status: 'active',
              is_manually_edited: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'translation_key, lang' },
          );
        translationMap.set(composite, {
          translation_key: entry.key,
          lang: entry.lang,
          translated_text: copyText,
          status: 'active',
          lang_id: langId,
        });
        copied += 1;
        continue;
      }
    }

    try {
      await supabase.from('translations').upsert(
        {
          translation_key: entry.key,
          lang: entry.lang,
          lang_id: langId,
          original_text: sourceText,
          translated_text: '...',
          status: 'healing',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'translation_key, lang' },
      );

      const prompt = `
Senior translator for Voices. Translate from NL to ${entry.lang}.
MARKET DNA: ${dnaCache[entry.lang] || ''}
CONTEXT: ${entry.item.context || 'General UI'}
TEKST: "${sourceText}"
OUTPUT: translated text only, no quotes, no explanations.
      `.trim();

      const translatedText = normalizeTranslatedText(await gemini.generateText(prompt, { lang: entry.lang }));
      if (!translatedText || SlopFilter.isSlop(translatedText, entry.lang, sourceText)) {
        await supabase
          .from('translations')
          .update({ status: 'healing_failed', updated_at: new Date().toISOString() })
          .match({ translation_key: entry.key, lang: entry.lang });
        failed += 1;
        continue;
      }

      await supabase.from('translations').upsert(
        {
          translation_key: entry.key,
          lang: entry.lang,
          lang_id: langId,
          original_text: sourceText,
          translated_text: translatedText,
          status: 'active',
          is_manually_edited: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'translation_key, lang' },
      );
      translationMap.set(composite, {
        translation_key: entry.key,
        lang: entry.lang,
        translated_text: translatedText,
        status: 'active',
        lang_id: langId,
      });
      healed += 1;
    } catch (error) {
      failed += 1;
      await supabase
        .from('translations')
        .update({ status: 'healing_failed', updated_at: new Date().toISOString() })
        .match({ translation_key: entry.key, lang: entry.lang });
      console.error(`[VoiceglotHealService] Failed item ${entry.key} (${entry.lang}):`, error);
    }
  }

  return {
    success: true,
    processed_count: toProcess.length,
    healed_count: healed,
    copied_count: copied,
    failed_count: failed,
    pending_total: Math.max(0, pendingQueue.length - toProcess.length),
    batch_size: batchSize,
    target_languages: targetLanguages,
    finished: pendingQueue.length <= toProcess.length,
  };
}

export async function persistVoiceglotRunHealth(payload: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  await supabase.from('app_configs').upsert(
    {
      key: 'voiceglot_cron_health',
      value: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  );
}

