import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 MARK: Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Regex to find hardcoded text in JSX
// Matches: >  Any text with at least 5 letters  <
// Excludes: VoiceglotText components, empty tags, etc.
const HARDCODED_TEXT_REGEX = />([^<{]*[a-zA-Z]{5,}[^<{]*)<\/((?!VoiceglotText)|(?!script)|(?!style))/g;

function generateKey(filePath: string, text: string): string {
  const filename = path.basename(filePath, path.extname(filePath)).toLowerCase().replace(/[^a-z0-9]/g, '_');
  const textHash = crypto.createHash('md5').update(text).digest('hex').substring(0, 6);
  // Shorten text for readability in key (max 20 chars)
  const textSlug = text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
  return `auto.${filename}.${textSlug}.${textHash}`;
}

async function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let matches = [];
  let match;

  // Find all matches first
  while ((match = HARDCODED_TEXT_REGEX.exec(content)) !== null) {
    // Filter out some false positives manually if needed
    if (match[1].includes('VoiceglotText')) continue;
    if (match[1].trim().length < 3) continue;
    
    matches.push({
      fullMatch: match[0],
      text: match[1],
      index: match.index
    });
  }

  if (matches.length === 0) return;

  console.log(`📝 MARK: Verwerken van ${path.basename(filePath)} (${matches.length} matches)...`);

  for (const m of matches) {
    const originalText = m.text;
    const cleanText = originalText.trim();
    
    // Skip if it looks like code or template literal
    if (cleanText.includes('${') || cleanText.includes('{{')) continue;

    const key = generateKey(filePath, cleanText);

    // 1. Check if exists
    const { data: existing } = await supabase
      .from('translations')
      .select('id')
      .eq('translation_key', key)
      .single();

    if (!existing) {
      // Insert new
      const { error } = await supabase.from('translations').insert({
        translation_key: key,
        lang: 'nl',
        original_text: cleanText,
        translated_text: cleanText,
        context: `Auto-extracted from ${path.basename(filePath)}`,
        status: 'active',
        is_manually_edited: false
      });

      if (error) {
        console.error(`   ❌ DB Error for "${cleanText}":`, error.message);
        continue;
      }
    } else {
        console.log(`   ℹ️  Key exists in DB: ${key}`);
    }

    // 2. Replace in content
    // We use a specific replacement to avoid messing up the file structure
    // We escape the text for regex usage
    const escapedText = originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaceRegex = new RegExp(`>${escapedText}<`, 'g');
    
    content = content.replace(replaceRegex, `><VoiceglotText translationKey="${key}" defaultText="${cleanText.replace(/"/g, '&quot;')}" /><`);
    console.log(`   ✅ Converted: "${cleanText.substring(0, 30)}..." -> ${key}`);
  }

  // 3. Add Import if needed
  if (content !== originalContent) {
    if (!content.includes('import { VoiceglotText }')) {
      // Try to add import after the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImportLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfImportLine + 1) + "import { VoiceglotText } from '@/components/ui/VoiceglotText';\n" + content.slice(endOfImportLine + 1);
      } else {
        content = "import { VoiceglotText } from '@/components/ui/VoiceglotText';\n" + content;
      }
    }
    fs.writeFileSync(filePath, content);
  }
}

async function run(targetPath: string) {
  if (!fs.existsSync(targetPath)) {
    console.error(`🔴 Path not found: ${targetPath}`);
    return;
  }

  const stats = fs.statSync(targetPath);
  if (stats.isFile()) {
    await processFile(targetPath);
  } else {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      const fullPath = path.join(targetPath, file);
      const s = fs.statSync(fullPath);
      if (s.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
          await run(fullPath);
        }
      } else if (/\.(tsx|jsx)$/.test(file)) {
        await processFile(fullPath);
      }
    }
  }
}

// CLI
const target = process.argv[2] || '1-SITE/apps/web/src/components/ui'; // Default focus area
console.log(`🌍 MARK VOICEGLOT SURGEON: Start operatie op ${target}...`);
run(target).then(() => console.log('🏁 Operatie voltooid.'));
