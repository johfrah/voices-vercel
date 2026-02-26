import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import matter from 'gray-matter';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function importBlueprints() {
  console.log('🚀 [MASTERCLASS] Importing Multilingual Blueprints from Kelder...');

  const blueprintsDir = path.join(process.cwd(), '4-KELDER/0-GRONDSTOFFEN-FABRIEK/nuclear-content/multilingual-shadow');
  
  if (!fs.existsSync(blueprintsDir)) {
    console.error('❌ Blueprints directory not found:', blueprintsDir);
    return;
  }

  const files = fs.readdirSync(blueprintsDir).filter(f => f.endsWith('.md'));
  console.log(`📊 Found ${files.length} blueprint files.`);

  // Get language map
  const dbLangs = await sql`SELECT id, code FROM public.languages`;
  const langMap = new Map();
  dbLangs.forEach(l => langMap.set(l.code.split('-')[0], l.id));

  let importCount = 0;

  for (const file of files) {
    const filePath = path.join(blueprintsDir, file);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(rawContent);

    const langCode = data.lang || file.split('-').pop()?.replace('.md', '');
    const langId = langMap.get(langCode);

    if (!langId) {
      console.warn(`⚠️ Skipping ${file} - Language ${langCode} not found in DB.`);
      continue;
    }

    const title = data.title || file.replace('.md', '').replace(/-/g, ' ');
    const slug = data.slug || file.replace('.md', '');

    try {
      await sql`
        INSERT INTO public.script_blueprints (title, slug, content, language_id, is_anonymous)
        VALUES (${title}, ${slug}, ${content.trim()}, ${langId}, true)
        ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content
      `;
      importCount++;
    } catch (e) {
      console.error(`❌ Failed to import ${file}:`, e);
    }
  }

  console.log(`✅ Imported ${importCount} blueprints into script_library.`);
  await sql.end();
}

importBlueprints();
