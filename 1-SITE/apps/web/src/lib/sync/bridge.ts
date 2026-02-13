export { db } from '@db';
import {
    actorDemos,
    actors,
    instructors,
    users
} from '@db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * NUCLEAR SYNC BRIDGE (The Navelstreng) - 100% ASSET-ACCURATE EDITION
 * 
 * Doel: Synchronisatie van data waarbij links EXACT worden omgezet
 * volgens de complexe regels van de 2026 asset-hervorming.
 */

const countryToIso: Record<string, string> = {
  'belgië': 'be', 'belgie': 'be', 'nederland': 'nl', 'verenigd koninkrijk': 'gb',
  'groot-brittannië': 'gb', 'groot brittannie': 'gb', 'spanje': 'es', 'italië': 'it', 
  'italie': 'it', 'frankrijk': 'fr', 'duitsland': 'de', 'amerika': 'us', 
  'denemarken': 'dk', 'polen': 'pl', 'brazillië': 'br', 'brazillie': 'br', 
  'portugal': 'pt', 'vietnam': 'vn', 'colombia': 'co', 'finland': 'fi',
  'noorwegen': 'no', 'zweden': 'se', 'turkije': 'tr', 'roemenië': 'ro',
  'roemenie': 'ro', 'tsjechië': 'cz', 'tsjechie' : 'cz', 'taiwan': 'tw'
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
  const { market, lang } = getMarketAndLang(actor.country || actor.nativeLang, actor.nativeLang);
  const firstName = (actor.firstName || actor.first_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const genderRaw = (actor.gender || '').toLowerCase();
  const gender = (genderRaw.includes('vrouw') || genderRaw === 'female') ? 'female' : 'male';
  
  let statusLabel = 'B'; 
  const status = (actor.status || '').toLowerCase();
  if (status === 'live' || status === 'publish') statusLabel = 'A';
  if (status === 'trash' || status === 'rejected') statusLabel = 'C';

  const displayId = actor.wpProductId || actor.wp_product_id || actor.id;
  const actorDir = `/assets/agency/voices/${market}/${lang}/${gender}/${firstName}-${statusLabel}-${displayId}`;
  
  if (type === 'photo') {
    return `${actorDir}/${firstName}-photo.jpg`;
  }
  
  if (type === 'videostill') {
    return `${actorDir}/${firstName}-video-still.jpg`;
  }

  if (demo) {
    const demoName = (demo.name || 'demo').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const nativeLang = (actor.nativeLang || actor.native_lang || 'nederlands').toLowerCase();
    const langLabel = langToLabel[nativeLang] || 'voiceover';
    return `${actorDir}/demos/${firstName}-${langLabel}-voiceover-${demoName}.mp3`;
  }
  
  return actorDir;
}

const isoToLabel: Record<string, string> = {
  'nl': 'Nederlands', 'fr': 'Frans', 'de': 'Duits', 'en': 'Engels',
  'es': 'Spaans', 'it': 'Italiaans', 'pt': 'Portugees', 'pl': 'Pools',
  'da': 'Deens', 'no': 'Noors', 'sv': 'Zweeds', 'tr': 'Turks',
  'ro': 'Roemeens', 'cs': 'Tsjechisch', 'vi': 'Vietnamees', 'fi': 'Fins'
};

function getCleanedLang(raw: string, country: string, extra: string): string {
  const l = (raw || '').toLowerCase().trim();
  const c = (country || '').toLowerCase().trim();
  const e = (extra || '').toLowerCase().trim();
  
  const validLangs = ['vlaams', 'nederlands', 'engels', 'frans', 'duits', 'spaans', 'italiaans', 'portugees', 'pools', 'deens'];
  
  // 1. Directe match
  if (validLangs.includes(l)) return raw.trim();
  if (l === 'vlaams' || l === 'be') return 'Vlaams';

  // 2. Fallback op extraLangs
  for (const valid of validLangs) {
    if (e.includes(valid)) return valid.charAt(0).toUpperCase() + valid.slice(1);
  }

  // 3. Fallback op country mapping
  for (const [key, iso] of Object.entries(langToIso)) {
    if (l.includes(key) || c.includes(key)) {
      return isoToLabel[iso] || 'Nederlands';
    }
  }

  return 'Nederlands'; // Standaard fallback
}

export async function seedInstructorBios() {
  console.log('🎙️ Seeding Instructor Bios with Legacy Accuracy...');
  
  try {
    // Update Bernadette
    await db.update(instructors)
      .set({
        tagline: "Gerenommeerde stemcoach en auteur van 'Klink Klaar'",
        bio: "Bernadette is een gerenommeerde stemcoach met een uitgebreide academische en professionele achtergrond. Ze heeft een bachelor en master in logopedie en audiologie en behaalde een doctoraat in de medische wetenschappen. Sinds 1984 geeft ze les aan studenten radio aan het RITCS en is ze docent stem in BATAC Radio. Ze werkt als adviseur voor mediahuizen zoals VRT, DPG en ATV, en is auteur van de bekende uitspraakgids 'Klink Klaar'."
      })
      .where(eq(instructors.name, "Bernadette Timmermans"));

    // Update Johfrah
    await db.update(instructors)
      .set({
        tagline: "Bedreven Vlaamse voice-over & bekroond regisseur",
        bio: "Johfrah is een bedreven Vlaamse voice-over met meer dan tien jaar ervaring in het inspreken van teksten voor webvideo's en commercials (Tesla, Samsung, Trivago). Naast zijn werk als voice-over is Johfrah ook een bekroond regisseur en cameraman, en oprichter van het internationale voice-over agency Voices.be. Via zijn YouTube-kanaal deelt hij waardevolle inzichten en praktische tips met beginnende voice-overs."
      })
      .where(eq(instructors.name, "Johfrah Lefebvre"));

    console.log('✅ Instructor bios updated.');
  } catch (e) {
    console.error('❌ Failed to seed instructor bios:', e);
  }
}

export async function syncAllData() {
  console.log('🚀 STARTING 100% ASSET-ACCURATE NUCLEAR SYNC (LOCAL FALLBACK)...');

  try {
    // 1. Sync Users
    console.log('👤 Syncing Users (Local File)...');
    const usersPath = path.join(process.cwd(), 'users_sync.json');
    if (fs.existsSync(usersPath)) {
      const usersDataRaw = fs.readFileSync(usersPath, 'utf8');
      const data = JSON.parse(usersDataRaw);
      const userData = data.users || [];
      console.log(`Found ${userData.length} users. Processing...`);
      
      for (const user of userData) {
        try {
          await db.insert(users).values({
            wpUserId: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
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
            set: { lastActive: new Date() }
          });
        } catch (e) {
          console.error(`  [ERROR] Failed to sync user ${user.email}:`, e);
        }
      }
      console.log(`✅ Users synced: ${userData.length}`);
    }

    // 2. Sync Actors & Demos
    console.log('🎙️ Syncing Actors & Demos (Local File)...');
    const actorsPath = path.join(process.cwd(), 'actors_sync.json');
    if (fs.existsSync(actorsPath)) {
      const actorsDataRaw = fs.readFileSync(actorsPath, 'utf8');
      const actorsData = JSON.parse(actorsDataRaw);
      const results = actorsData.actors || [];
      console.log(`Found ${results.length} actors. Processing...`);
      
      for (const actor of results) {
        try {
          // Flatten the full_rates structure for the rates JSONB field
          const ratesObj: Record<string, any> = {};
          if (actor.full_rates && actor.full_rates.countries) {
            for (const [country, rates] of Object.entries(actor.full_rates.countries)) {
              ratesObj[country] = rates;
            }
          }
          if (actor.full_rates && actor.full_rates.global) {
            ratesObj['GLOBAL'] = actor.full_rates.global;
          }

          const cleanedNativeLang = getCleanedLang(actor.native_lang, actor.country, actor.extra_langs || '');

          const [existingActor] = await db.select().from(actors).where(eq(actors.wpProductId, actor.product_id)).limit(1);
          
          // 🛡️ NUCLEAR LOCK MANDATE: Overschrijf nooit handmatige aanpassingen
          if (existingActor?.isManuallyEdited) {
            console.log(`[LOCK] Skipping actor ${actor.product_id} (${actor.first_name}) due to manual edits.`);
            continue;
          }

          const photoPath = actor.photo_url || getExactAssetPath(actor, null, 'photo');

          await db.insert(actors).values({
            wpProductId: actor.product_id,
            firstName: actor.first_name,
            lastName: actor.last_name,
            email: actor.email,
            gender: actor.gender,
            nativeLang: cleanedNativeLang,
            country: actor.country,
            status: actor.status || 'live',
            isPublic: actor.status === 'live',
            voiceScore: actor.voice_score,
            menuOrder: actor.menu_order || 0,
            priceUnpaid: actor.price_unpaid?.toString(),
            priceOnline: actor.price_online?.toString(),
            priceIvr: actor.price_ivr?.toString(),
            priceLiveRegie: actor.price_live_regie?.toString(),
            rates: ratesObj,
            dropboxUrl: photoPath,
            isManuallyEdited: false, // Reset lock bij automatische sync (indien niet gelockt)
            updatedAt: new Date()
          }).onConflictDoUpdate({
            target: actors.wpProductId,
            set: { 
              voiceScore: actor.voice_score, 
              dropboxUrl: photoPath, 
              rates: ratesObj,
              email: actor.email,
              nativeLang: cleanedNativeLang,
              priceUnpaid: actor.price_unpaid?.toString(),
              priceOnline: actor.price_online?.toString(),
              priceIvr: actor.price_ivr?.toString(),
              priceLiveRegie: actor.price_live_regie?.toString(),
              updatedAt: new Date() 
            }
          });

          // Fetch the actor again to get the internal ID for demos
          const [dbActor] = await db.select().from(actors).where(eq(actors.wpProductId, actor.product_id)).limit(1);

          if (dbActor && actor.demos) {
            for (const demo of actor.demos) {
              const originalUrl = demo.url;
              const newPath = getExactAssetPath(dbActor, demo);
              const finalUrl = originalUrl || newPath;
              
              await db.insert(actorDemos).values({
                actorId: dbActor.id,
                wpId: demo.id,
                name: demo.name,
                url: finalUrl,
                type: demo.type || 'demo',
                isPublic: true
              }).onConflictDoUpdate({
                target: actorDemos.wpId,
                set: { url: finalUrl }
              });
            }
          }
        } catch (e) {
          console.error(`  [ERROR] Failed to sync actor ${actor.id}:`, e);
        }
      }
      console.log(`✅ Actors synced: ${results.length}`);
    }

    console.log('🏁 NUCLEAR SYNC COMPLETED.');
  } catch (error) {
    console.error('❌ SYNC FAILED:', error);
  }
}
