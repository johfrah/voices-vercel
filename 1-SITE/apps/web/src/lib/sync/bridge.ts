import { db, getTable } from '@/lib/system/voices-config';
export { db };

const actorDemos = getTable('actorDemos');
const actors = getTable('actors');
const instructors = getTable('instructors');
const users = getTable('users');
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { ServerWatchdog } from '@/lib/services/server-watchdog';

/**
 * NUCLEAR SYNC BRIDGE (The Navelstreng) - ATOMIC EDITION
 * 
 * 🛡️ CHRIS-PROTOCOL: Atomic Trace Mandate (v2.14.510)
 */

const countryToIso: Record<string, string> = {
  'belgi': 'be', 'belgie': 'be', 'nederland': 'nl', 'verenigd koninkrijk': 'gb',
  'groot-brittanni': 'gb', 'groot brittannie': 'gb', 'spanje': 'es', 'itali': 'it', 
  'italie': 'it', 'frankrijk': 'fr', 'duitsland': 'de', 'amerika': 'us', 
  'denemarken': 'dk', 'polen': 'pl', 'brazilli': 'br', 'brazillie': 'br', 
  'portugal': 'pt', 'vietnam': 'vn', 'colombia': 'co', 'finland': 'fi',
  'noorwegen': 'no', 'zweden': 'se', 'turkije': 'tr', 'roemeni': 'ro',
  'roemenie': 'ro', 'tsjechi': 'cz', 'tsjechie' : 'cz', 'taiwan': 'tw'
};

const langToIso: Record<string, string> = {
  'nederlands': 'nl', 'vlaams': 'nl', 'frans': 'fr', 
  'duits': 'de', 'engels': 'en', 'spaans': 'es', 
  'portugees': 'pt', 'italiaans': 'it', 'pools': 'pl', 
  'deens': 'da', 'noors': 'no', 'zweeds': 'sv',
  'turks': 'tr', 'roemeens': 'ro', 'tsjechisch': 'cs',
  'vietnamees': 'vi', 'colombiaans': 'es', 'fins': 'fi',
  'nl': 'nl', 'be': 'nl', 'fr': 'fr', 'en': 'en', 'de': 'de',
  'es': 'es', 'it': 'it', 'pt': 'pt', 'pl': 'pl', 'da': 'da'
};

const langToLabel: Record<string, string> = {
  'vlaams': 'flemish', 'nederlands': 'dutch', 'frans': 'french',
  'duits': 'german', 'engels': 'english', 'spaans': 'spanish',
  'portugees': 'portuguese', 'italiaans': 'italian', 'pools': 'polish',
  'deens': 'danish', 'nl': 'dutch', 'be': 'flemish', 'fr': 'french', 'en': 'english'
};

const langToDefaultCountry: Record<string, string> = {
  'nl': 'nl', 'fr': 'fr', 'en': 'gb', 'de': 'de', 
  'es': 'es', 'it': 'it', 'pt': 'pt', 'pl': 'pl', 
  'da': 'dk', 'no': 'no', 'sv' : 'se', 'tr': 'tr',
  'ro': 'ro', 'cs': 'cz', 'vi': 'vn', 'fi': 'fi'
};

function getMarketAndLang(countryRaw: string, langRaw: string) {
  const c = countryRaw?.toLowerCase().trim() || '';
  const l = langRaw?.toLowerCase().trim() || '';
  
  let langIso = 'nl';
  for (const [key, iso] of Object.entries(langToIso)) {
    if (l.includes(key)) {
      langIso = iso;
      break;
    }
  }

  let countryIso = '';
  for (const [key, iso] of Object.entries(countryToIso)) {
    if (c.includes(key)) {
      countryIso = iso;
      break;
    }
  }

  if (l.includes('vlaams') || l.includes('be')) {
    return { market: 'be', lang: 'nl' };
  }

  if (!countryIso) {
    countryIso = langToDefaultCountry[langIso] || 'zz';
  }
  
  return { market: countryIso, lang: langIso };
}

function getExactAssetPath(actor: any, demo?: any, type: 'demo' | 'photo' | 'videostill' = 'demo') {
  const { market, lang } = getMarketAndLang(actor.country || actor.native_lang, actor.native_lang);
  const firstName = (actor.first_name || actor.first_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const genderRaw = (actor.gender || '').toLowerCase();
  const gender = (genderRaw.includes('vrouw') || genderRaw === 'female') ? 'female' : 'male';
  
  let statusLabel = 'B'; 
  const status = (actor.status || '').toLowerCase();
  if (status === 'live' || status === 'publish') statusLabel = 'A';
  if (status === 'trash' || status === 'rejected') statusLabel = 'C';

  const displayId = actor.wp_product_id || actor.wp_product_id || actor.id;
  const actorDir = `/assets/agency/voices/${market}/${lang}/${gender}/${firstName}-${statusLabel}-${displayId}`;
  
  if (type === 'photo') {
    return `${actorDir}/${firstName}-photo.jpg`;
  }
  
  if (type === 'videostill') {
    return `${actorDir}/${firstName}-video-still.jpg`;
  }

  if (demo) {
    const demoName = (demo.name || 'demo').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const nativeLang = (actor.native_lang || actor.native_lang || 'nederlands').toLowerCase();
    const langLabel = langToLabel[nativeLang] || 'voiceover';
    return `${actorDir}/demos/${firstName}-${langLabel}-voiceover-${demoName}.mp3`;
  }
  
  return actorDir;
}

function getCleanedLang(raw: string, country: string, extra: string): string {
  const l = (raw || '').toLowerCase().trim();
  const c = (country || '').toLowerCase().trim();
  const e = (extra || '').toLowerCase().trim();
  
  const { MarketManagerServer: MarketManager } = require('@/lib/system/market-manager-server');
  
  const iso = MarketManager.getLanguageCode(l);
  if (iso && iso !== l) return MarketManager.getLanguageLabel(iso);

  const validLangs = ['vlaams', 'nederlands', 'engels', 'frans', 'duits', 'spaans', 'italiaans', 'portugees', 'pools', 'deens'];
  
  if (validLangs.includes(l)) return MarketManager.getLanguageLabel(l);
  if (l === 'vlaams' || l === 'be') return MarketManager.getLanguageLabel('nl-be');

  for (const valid of validLangs) {
    if (e.includes(valid)) return MarketManager.getLanguageLabel(valid);
  }

  for (const [key, isoCode] of Object.entries(langToIso)) {
    if (l.includes(key) || c.includes(key)) {
      return MarketManager.getLanguageLabel(isoCode);
    }
  }

  return MarketManager.getLanguageLabel('nl-nl');
}

export async function syncAllData() {
  return await ServerWatchdog.atomic('SyncBridge', 'SyncAllData', {}, async () => {
    // 1. Sync Users
    const usersPath = path.join(process.cwd(), 'users_sync.json');
    if (fs.existsSync(usersPath)) {
      const usersDataRaw = fs.readFileSync(usersPath, 'utf8');
      const data = JSON.parse(usersDataRaw);
      const userData = data.users || [];
      
      for (const user of userData) {
        await db.insert(users).values({
          wpUserId: Number(user.id),
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.billing_phone,
          companyName: user.billing_company,
          vatNumber: user.billing_vat_number,
          role: user.roles?.[0] || 'guest',
          subroles: user.subroles || [],
          approvedFlows: user.approved_flows || ['commercial', 'corporate', 'telephony'],
          customerInsights: user.customer_insights || {},
          preferences: user.preferences || {}
        }).onConflictDoUpdate({
          target: users.wpUserId,
          set: { lastActive: new Date().toISOString() as any }
        });
      }
    }

    // 2. Sync Actors & Demos
    const actorsPath = path.join(process.cwd(), 'actors_sync.json');
    if (fs.existsSync(actorsPath)) {
      const actorsDataRaw = fs.readFileSync(actorsPath, 'utf8');
      const actorsData = JSON.parse(actorsDataRaw);
      const results = actorsData.actors || [];
      
      for (const actor of results) {
        const ratesObj: Record<string, any> = {};
        if (actor.full_rates?.countries) {
          for (const [country, rates] of Object.entries(actor.full_rates.countries)) {
            ratesObj[country] = rates;
          }
        }
        if (actor.full_rates?.global) {
          ratesObj['GLOBAL'] = actor.full_rates.global;
        }

        const cleanedNativeLang = getCleanedLang(actor.native_lang, actor.country, actor.extra_langs || '');
        const [existingActor] = await db.select().from(actors).where(eq(actors.wp_product_id, actor.product_id)).limit(1);
        
        if (existingActor?.is_manually_edited) continue;

        const photoPath = actor.photo_url || getExactAssetPath(actor, null, 'photo');

        await db.insert(actors).values({
          wp_product_id: Number(actor.product_id),
          first_name: actor.first_name,
          last_name: actor.last_name,
          email: actor.email,
          gender: actor.gender,
          native_lang: cleanedNativeLang,
          country: actor.country,
          status: actor.status || 'live',
          is_public: actor.status === 'live',
          voice_score: actor.voice_score,
          menu_order: actor.menu_order || 0,
          price_unpaid: actor.price_unpaid?.toString(),
          price_online: actor.price_online?.toString(),
          price_ivr: actor.price_ivr?.toString(),
          price_live_regie: actor.price_live_regie?.toString(),
          rates: ratesObj,
          dropbox_url: photoPath,
          is_manually_edited: false,
          updatedAt: new Date().toISOString() as any
        }).onConflictDoUpdate({
          target: actors.wp_product_id,
          set: { 
            voice_score: actor.voice_score, 
            dropbox_url: photoPath, 
            rates: ratesObj,
            email: actor.email,
            native_lang: cleanedNativeLang,
            price_unpaid: actor.price_unpaid?.toString(),
            price_online: actor.price_online?.toString(),
            price_ivr: actor.price_ivr?.toString(),
            price_live_regie: actor.price_live_regie?.toString(),
            updatedAt: new Date().toISOString() as any 
          }
        });

        const [dbActor] = await db.select().from(actors).where(eq(actors.wp_product_id, actor.product_id)).limit(1);

        if (dbActor && actor.demos) {
          for (const demo of actor.demos) {
            const finalUrl = demo.url || getExactAssetPath(dbActor, demo);
            await db.insert(actorDemos).values({
              actorId: dbActor.id,
              wpId: demo.id,
              name: demo.name,
              url: finalUrl,
              type: demo.type || 'demo',
              is_public: true
            }).onConflictDoUpdate({
              target: actorDemos.wpId,
              set: { url: finalUrl }
            });
          }
        }
      }
    }
    return { success: true };
  });
}
