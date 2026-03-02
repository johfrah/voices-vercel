import fs = require('fs');
import path = require('path');
import postgres = require('postgres');
import * as dotenv from 'dotenv';

// Load env from apps/web/.env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SQL_PATH = path.join(__dirname, '../../../../4-KELDER/CONTAINER/ID348299_voices.sql');
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.vcbxyyjsxuquytcsskpj:VoicesHeadless20267654323456@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
}

const sql = postgres(DATABASE_URL);

function cleanseText(text: string): string {
    if (!text) return '';
    
    return text
        .replace(/<[^>]*>?/gm, '') // Strip HTML
        .replace(/\\'/g, "'") // Fix escaped quotes
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

function fixSpelling(text: string): string {
    if (!text) return '';
    
    const corrections: Record<string, string> = {
        'andrs wand': 'anders want',
        'as pro': 'als pro',
        'as proficsonile': 'als professional',
        'voice-overs': 'voice-overs',
        'voiceover': 'voice-over',
        'voicemailstem': 'voicemail-stem',
        'klantvriendelijke': 'klantvriendelijke',
        'to the point': 'to-the-point',
        'to-the point': 'to-the-point',
        'leerijke': 'leerrijke',
        'leeryke': 'leerrijke',
        'proffessioneel': 'professioneel',
        'proffesioneel': 'professioneel',
        'aanrader!': 'aanrader!',
        'aanrader.': 'aanrader.',
        'supervlot': 'super vlot',
        'topservice': 'topservice'
    };

    let fixed = text;
    for (const [wrong, right] of Object.entries(corrections)) {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        fixed = fixed.replace(regex, right);
    }
    
    return fixed;
}

async function run() {
    console.log('🚀 Starting Review Cleanse & Sync...');
    
    if (!fs.existsSync(SQL_PATH)) {
        console.error('❌ SQL dump not found at:', SQL_PATH);
        process.exit(1);
    }

    const data = fs.readFileSync(SQL_PATH, 'utf8');
    const startMarker = "INSERT INTO `wp_voices_reviews`";
    const reviewData: any[] = [];
    
    let pos = 0;
    while (true) {
        let insertStart = data.indexOf(startMarker, pos);
        if (insertStart === -1) break;
        
        let valuesStart = data.indexOf('VALUES', insertStart);
        if (valuesStart === -1) break;
        
        pos = valuesStart + 6;
        
        while (pos < data.length) {
            let start = data.indexOf('(', pos);
            if (start === -1 || (insertStart !== -1 && start > data.indexOf(startMarker, insertStart + 1) && data.indexOf(startMarker, insertStart + 1) !== -1)) break;
            
            let end = -1;
            let inQuote = false;
            for (let i = start; i < data.length; i++) {
                if (data[i] === "'" && data[i - 1] !== '\\') inQuote = !inQuote;
                if (!inQuote && data[i] === ')') {
                    end = i;
                    break;
                }
            }
            if (end === -1) break;
            
            const row = data.substring(start + 1, end);
            const parts: string[] = [];
            let currentPart = '';
            inQuote = false;
            for (let i = 0; i < row.length; i++) {
                if (row[i] === "'" && row[i - 1] !== '\\') inQuote = !inQuote;
                else if (row[i] === ',' && !inQuote) {
                    parts.push(currentPart.trim());
                    currentPart = '';
                } else currentPart += row[i];
            }
            parts.push(currentPart.trim());
            
            if (parts.length > 10) {
                const author = parts[7]?.replace(/^'|'$/g, '');
                if (author && author !== 'author_name' && !author.includes('`')) {
                    const rawText = parts[10]?.replace(/^'|'$/g, '');
                    const cleansedText = fixSpelling(cleanseText(rawText));
                    
                    let photoUrl = '';
                    const photosRaw = parts[16]?.trim().replace(/^'|'$/g, '');
                    if (photosRaw && photosRaw !== 'NULL' && photosRaw !== '[]') {
                        try {
                            // The SQL dump has escaped slashes and double backslashes
                            const cleaned = photosRaw
                                .replace(/\\\\/g, '\\') // Fix double backslashes
                                .replace(/\\"/g, '"')   // Fix escaped quotes
                                .replace(/\\\//g, '/'); // Fix escaped slashes
                            
                            // If it starts with [" and ends with "], it's a JSON array
                            if (cleaned.startsWith('["') && cleaned.endsWith('"]')) {
                                const p = JSON.parse(cleaned);
                                if (Array.isArray(p) && p.length > 0) photoUrl = p[0];
                            } else if (cleaned.startsWith('http')) {
                                photoUrl = cleaned;
                            }
                        } catch (e) {
                            console.warn(`⚠️ Failed to parse photo for ${author}: ${photosRaw}`);
                        }
                    }

                    let iapContext = null;
                    const iapRaw = parts[25]?.replace(/^'|'$/g, '');
                    if (iapRaw && iapRaw !== 'NULL') {
                        try {
                            const cleaned = iapRaw.replace(/\\\\/g, '');
                            iapContext = JSON.parse(cleaned);
                        } catch (e) {}
                    }

                    reviewData.push({
                        wp_id: parseInt(parts[0]),
                        provider: parts[1]?.replace(/^'|'$/g, '') || 'google_places',
                        business_slug: parts[4]?.replace(/^'|'$/g, ''),
                        author_name: author,
                        author_url: parts[8]?.replace(/^'|'$/g, ''),
                        author_photo_url: photoUrl,
                        rating: parseInt(parts[9]),
                        text_nl: cleansedText,
                        text_fr: cleanseText(parts[11]?.replace(/^'|'$/g, '')),
                        text_en: cleanseText(parts[12]?.replace(/^'|'$/g, '')),
                        text_de: cleanseText(parts[13]?.replace(/^'|'$/g, '')),
                        iap_context: iapContext ? JSON.stringify(iapContext) : null,
                        sentiment_velocity: parseInt(parts[26]) || 0,
                        persona: parts[22]?.replace(/^'|'$/g, ''),
                        sector: parts[24]?.replace(/^'|'$/g, ''),
                        created_at: parts[14]?.replace(/^'|'$/g, '')
                    });
                }
            }
            pos = end + 1;
            if (data[pos] === ';') break;
        }
    }

    console.log(`✅ Parsed ${reviewData.length} reviews.`);
    
    // DEBUG: Check first few reviews for photos
    reviewData.slice(0, 5).forEach(r => console.log(`DEBUG: ${r.author_name} photo: ${r.author_photo_url}`));

    console.log('💉 Injecting into Supabase via raw SQL...');
    for (const review of reviewData) {
        try {
            await sql`
                INSERT INTO reviews ${sql(review)}
                ON CONFLICT (wp_id) DO UPDATE SET ${sql(review)}
            `;
        } catch (e) {
            console.error(`❌ Failed to inject review for ${review.author_name}:`, e);
        }
    }

    console.log('✨ Injection complete.');
    await sql.end();
    process.exit(0);
}

run();
