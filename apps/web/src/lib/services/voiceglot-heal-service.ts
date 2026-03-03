import { SlopFilter } from '@/lib/engines/slop-filter';
import { getCanonicalTranslationLocale } from '@/lib/system/locale-utils';
import { createClient } from '@supabase/supabase-js';
import { GeminiService } from './gemini-service';

export const VOICEGLOT_TARGET_LANGUAGES = ['nl-be', 'en-gb', 'fr-be', 'de-de', 'es-es', 'pt-pt', 'it-it'] as const;

export const VOICEGLOT_ALIAS_TO_CANONICAL: Record<string, string> = {
  'nl-nl': 'nl-be',
  'fr-fr': 'fr-be',
  'en-us': 'en-gb',
  'en-eu': 'en-gb',
};

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
  original_text?: string | null;
  status?: string | null;
  lang_id?: number | null;
  is_manually_edited?: boolean | null;
  updated_at?: string | null;
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

export type VoiceglotCanonicalizationResult = {
  success: boolean;
  merged_to_canonical: number;
  seeded_source_language: number;
  purged_alias_rows: number;
  canonical_target_languages: string[];
  alias_locales: string[];
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

function getCanonicalLocales(locales?: readonly string[]): string[] {
  const input = locales && locales.length > 0 ? locales : VOICEGLOT_TARGET_LANGUAGES;
  return Array.from(
    new Set(
      input.map((value) => getCanonicalTranslationLocale(String(value || '').toLowerCase(), 'nl-be')).filter(Boolean),
    ),
  );
}

function getAliasLocalesForCanonical(canonicalLocales: readonly string[]): string[] {
  return Object.entries(VOICEGLOT_ALIAS_TO_CANONICAL)
    .filter(([, canonical]) => canonicalLocales.includes(String(canonical).toLowerCase()))
    .map(([alias]) => alias.toLowerCase());
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
      .select('translation_key, lang, translated_text, original_text, status, lang_id, is_manually_edited, updated_at')
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

function getRowScore(row?: ExistingTranslation | null): number {
  if (!row) return 0;
  const hasTranslated = !!row.translated_text && row.translated_text.trim() !== '' && row.translated_text !== '...';
  const statusScore = row.status === 'active' ? 30 : 0;
  const manualScore = row.is_manually_edited ? 40 : 0;
  const translatedScore = hasTranslated ? 20 : 0;
  const freshnessScore = row.updated_at ? new Date(row.updated_at).getTime() / 1e15 : 0;
  return statusScore + manualScore + translatedScore + freshnessScore;
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const cleaned = String(raw || '').replace(/```json|```/g, '').trim();
  if (!cleaned) return {};
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    return {};
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!objectMatch) return {};
    try {
      const parsed = JSON.parse(objectMatch[0]);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
      return {};
    } catch {
      return {};
    }
  }
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

async function translateBatchWithGemini(
  gemini: GeminiService,
  lang: string,
  batch: Array<{ key: string; sourceText: string; context?: string | null }>,
): Promise<Record<string, string>> {
  if (batch.length === 0) return {};
  const payload = batch.map((item) => ({
    key: item.key,
    text: item.sourceText,
    context: item.context || '',
  }));
  const prompt = `
You are a professional UI translator for a multilingual webshop.
Translate each Dutch "text" to locale "${lang}".
Return STRICT JSON object only:
{
  "translation_key_1": "translated text",
  "translation_key_2": "translated text"
}
Rules:
- Keep placeholders like {name} unchanged.
- Keep brand names unchanged.
- No markdown, no explanation, JSON object only.
INPUT:
${JSON.stringify(payload)}
  `.trim();
  const response = await gemini.generateText(prompt, { lang, jsonMode: true });
  const parsed = parseJsonObject(response);
  const result: Record<string, string> = {};
  for (const item of batch) {
    const raw = parsed[item.key];
    if (typeof raw !== 'string') continue;
    const text = normalizeTranslatedText(raw);
    if (!text || text === '...') continue;
    result[item.key] = text;
  }
  return result;
}

export async function getVoiceglotCoverageSnapshot(
  targetLanguages: readonly string[] = VOICEGLOT_TARGET_LANGUAGES,
): Promise<VoiceglotCoverageSnapshot> {
  const canonicalTargets = getCanonicalLocales(targetLanguages);
  const registryItems = await fetchAllRegistryItems();
  const keys = registryItems.map((item) => item.string_hash).filter(Boolean);
  const existing = await fetchExistingTranslations(canonicalTargets);
  const map = new Map<string, ExistingTranslation>();
  existing.forEach((row) => {
    const composite = `${row.translation_key}::${String(row.lang).toLowerCase()}`;
    map.set(composite, row);
  });

  const totalRegistry = keys.length;
  const coverage = canonicalTargets.map((lang) => {
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

export async function canonicalizeVoiceglotTranslations(options?: {
  purgeAliases?: boolean;
  canonicalLanguages?: readonly string[];
}): Promise<VoiceglotCanonicalizationResult> {
  const canonicalLanguages = getCanonicalLocales(options?.canonicalLanguages || VOICEGLOT_TARGET_LANGUAGES);
  const aliasLocales = getAliasLocalesForCanonical(canonicalLanguages);
  const supabase = getSupabaseAdmin();
  const langIds = await fetchLanguageIds(canonicalLanguages);
  const registryItems = await fetchAllRegistryItems();
  const registryMap = new Map<string, RegistryItem>();
  registryItems.forEach((item) => {
    if (item.string_hash) registryMap.set(item.string_hash, item);
  });

  const existingRows = await fetchExistingTranslations([...canonicalLanguages, ...aliasLocales]);
  const translationMap = new Map<string, ExistingTranslation>();
  existingRows.forEach((row) => {
    const composite = `${row.translation_key}::${String(row.lang).toLowerCase()}`;
    translationMap.set(composite, row);
  });

  let mergedToCanonical = 0;
  let seededSourceLanguage = 0;
  for (const [alias, canonical] of Object.entries(VOICEGLOT_ALIAS_TO_CANONICAL)) {
    if (!aliasLocales.includes(alias) || !canonicalLanguages.includes(canonical)) continue;
    const canonicalLangId = langIds.get(canonical) || null;

    const translationEntries = Array.from(translationMap.entries());
    for (const [composite, aliasRow] of translationEntries) {
      if (!composite.endsWith(`::${alias}`)) continue;
      if (!hasActiveTranslation(aliasRow)) continue;
      const key = aliasRow.translation_key;
      const canonicalComposite = `${key}::${canonical}`;
      const canonicalRow = translationMap.get(canonicalComposite);

      if (getRowScore(aliasRow) <= getRowScore(canonicalRow)) continue;
      const sourceText = registryMap.get(key)?.original_text || aliasRow.original_text || '';
      const translatedText = normalizeTranslatedText(aliasRow.translated_text || '');
      if (!translatedText) continue;

      await supabase.from('translations').upsert(
        {
          translation_key: key,
          lang: canonical,
          lang_id: canonicalLangId,
          original_text: sourceText,
          translated_text: translatedText,
          status: 'active',
          is_manually_edited: aliasRow.is_manually_edited ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'translation_key, lang' },
      );
      translationMap.set(canonicalComposite, {
        translation_key: key,
        lang: canonical,
        lang_id: canonicalLangId,
        original_text: sourceText,
        translated_text: translatedText,
        status: 'active',
        is_manually_edited: aliasRow.is_manually_edited ?? false,
        updated_at: new Date().toISOString(),
      });
      mergedToCanonical += 1;
    }
  }

  // Source language should be complete for canonical NL.
  if (canonicalLanguages.includes('nl-be')) {
    const nlLangId = langIds.get('nl-be') || null;
    for (const item of registryItems) {
      if (!item.string_hash || !item.original_text) continue;
      const key = item.string_hash;
      const nlComposite = `${key}::nl-be`;
      const existing = translationMap.get(nlComposite);
      if (hasActiveTranslation(existing)) continue;
      const text = normalizeTranslatedText(item.original_text);
      if (!text) continue;

      await supabase.from('translations').upsert(
        {
          translation_key: key,
          lang: 'nl-be',
          lang_id: nlLangId,
          original_text: item.original_text,
          translated_text: text,
          status: 'active',
          is_manually_edited: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'translation_key, lang' },
      );
      translationMap.set(nlComposite, {
        translation_key: key,
        lang: 'nl-be',
        lang_id: nlLangId,
        original_text: item.original_text,
        translated_text: text,
        status: 'active',
        is_manually_edited: true,
        updated_at: new Date().toISOString(),
      });
      seededSourceLanguage += 1;
    }
  }

  let purgedAliasRows = 0;
  if (options?.purgeAliases && aliasLocales.length > 0) {
    const { count: beforeDelete } = await supabase
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .in('lang', aliasLocales);
    const { error: deleteError } = await supabase
      .from('translations')
      .delete()
      .in('lang', aliasLocales);
    if (deleteError) throw deleteError;
    purgedAliasRows = beforeDelete || 0;
  }

  return {
    success: true,
    merged_to_canonical: mergedToCanonical,
    seeded_source_language: seededSourceLanguage,
    purged_alias_rows: purgedAliasRows,
    canonical_target_languages: canonicalLanguages,
    alias_locales: aliasLocales,
  };
}

export async function runVoiceglotHealBatch(options?: {
  batchSize?: number;
  targetLanguages?: readonly string[];
}): Promise<VoiceglotHealBatchResult> {
  const targetLanguages = getCanonicalLocales(options?.targetLanguages || VOICEGLOT_TARGET_LANGUAGES);
  const batchSize = Math.max(1, Math.min(options?.batchSize || 120, 500));

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
    if (!item || !item.original_text) continue;
    for (const lang of targetLanguages) {
      // nl-be is source language and should not trigger Gemini translation.
      if (lang === 'nl-be') continue;
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
  let healed = 0;
  let failed = 0;

  const groupedByLang = new Map<string, Array<{ key: string; item: RegistryItem }>>();
  for (const entry of toProcess) {
    const list = groupedByLang.get(entry.lang) || [];
    list.push({ key: entry.key, item: entry.item });
    groupedByLang.set(entry.lang, list);
  }

  const groupedEntries = Array.from(groupedByLang.entries()) as Array<
    [string, Array<{ key: string; item: RegistryItem }>]
  >;
  for (const [lang, entries] of groupedEntries) {
    const langId = langIds.get(lang) || null;
    const placeholderRows = entries.map((entry) => ({
      translation_key: entry.key,
      lang,
      lang_id: langId,
      original_text: entry.item.original_text || '',
      translated_text: '...',
      status: 'healing',
      updated_at: new Date().toISOString(),
    }));
    await supabase.from('translations').upsert(placeholderRows, { onConflict: 'translation_key, lang' });

    for (const chunk of chunkArray(entries, 30)) {
      const batchInput = chunk.map((entry) => ({
        key: entry.key,
        sourceText: entry.item.original_text || '',
        context: entry.item.context || null,
      }));
      const translated = await translateBatchWithGemini(gemini, lang, batchInput);

      const successRows: any[] = [];
      const failedRows: any[] = [];
      for (const entry of chunk) {
        const sourceText = entry.item.original_text || '';
        const translatedText = normalizeTranslatedText(translated[entry.key] || '');
        if (translatedText && !SlopFilter.isSlop(translatedText, lang, sourceText)) {
          successRows.push({
            translation_key: entry.key,
            lang,
            lang_id: langId,
            original_text: sourceText,
            translated_text: translatedText,
            status: 'active',
            is_manually_edited: false,
            updated_at: new Date().toISOString(),
          });
          healed += 1;
          continue;
        }

        // Fallback to single translate if batch missed this key.
        try {
          const singlePrompt = `
Translate from Dutch to ${lang}. Output translated text only.
CONTEXT: ${entry.item.context || 'General UI'}
TEXT: "${sourceText}"
          `.trim();
          const singleText = normalizeTranslatedText(await gemini.generateText(singlePrompt, { lang }));
          if (singleText && !SlopFilter.isSlop(singleText, lang, sourceText)) {
            successRows.push({
              translation_key: entry.key,
              lang,
              lang_id: langId,
              original_text: sourceText,
              translated_text: singleText,
              status: 'active',
              is_manually_edited: false,
              updated_at: new Date().toISOString(),
            });
            healed += 1;
            continue;
          }
        } catch {
          // no-op; fail row will be written below
        }

        failedRows.push({
          translation_key: entry.key,
          lang,
          lang_id: langId,
          original_text: sourceText,
          translated_text: '...',
          status: 'healing_failed',
          is_manually_edited: false,
          updated_at: new Date().toISOString(),
        });
        failed += 1;
      }

      if (successRows.length > 0) {
        await supabase.from('translations').upsert(successRows, { onConflict: 'translation_key, lang' });
      }
      if (failedRows.length > 0) {
        await supabase.from('translations').upsert(failedRows, { onConflict: 'translation_key, lang' });
      }
    }
  }

  return {
    success: true,
    processed_count: toProcess.length,
    healed_count: healed,
    copied_count: 0,
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

