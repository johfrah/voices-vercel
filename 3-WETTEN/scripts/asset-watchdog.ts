import { createClient } from '@supabase/supabase-js';
import chokidar from 'chokidar';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// 🛡️ CHRIS-PROTOCOL: Nuclear Asset Watchdog (2026)
// Dit script zorgt dat Dropbox (lokaal) en Supabase (online) synchroon lopen.
// Dropbox is de backup/werkplek, Supabase is de "Only Source of Truth" voor de site.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Laad .env vanuit de web app folder
dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'voices'; // De standaard bucket voor assets

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('❌ Error: Supabase credentials niet gevonden in .env.local'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// De map die we in de gaten houden (Dropbox root voor assets)
const WATCH_DIR = path.resolve(__dirname, '../../1-SITE/assets');

console.log(chalk.bold.cyan('\n🚀 VOICES ASSET WATCHDOG: STARTING SYNC...\n'));
console.log(chalk.gray(`Watching: ${WATCH_DIR}`));
console.log(chalk.gray(`Target Bucket: ${BUCKET_NAME}\n`));

const watcher = chokidar.watch(WATCH_DIR, {
  ignored: /(^|[\/\\])\../, // negeer dotfiles
  persistent: true,
  ignoreInitial: false // we willen ook de huidige staat syncen bij start
});

async function uploadFile(filePath: string) {
  const relativePath = path.relative(WATCH_DIR, filePath);
  const fileContent = fs.readFileSync(filePath);
  
  // 🛡️ CHRIS-PROTOCOL: Opschonen van paden (geen spaties/accenten voor Supabase)
  const cleanPath = relativePath.replace(/ /g, '_').toLowerCase();

  console.log(chalk.yellow(`⏳ Syncing: ${relativePath} -> ${cleanPath}...`));

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(cleanPath, fileContent, {
      upsert: true,
      contentType: getContentType(filePath)
    });

  if (error) {
    console.error(chalk.red(`❌ Sync failed for ${relativePath}:`), error.message);
  } else {
    console.log(chalk.green(`✅ Synced: ${cleanPath}`));
  }
}

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf'
  };
  return map[ext] || 'application/octet-stream';
}

watcher
  .on('add', path => uploadFile(path))
  .on('change', path => uploadFile(path))
  .on('unlink', async filePath => {
    const relativePath = path.relative(WATCH_DIR, filePath);
    const cleanPath = relativePath.replace(/ /g, '_').toLowerCase();
    console.log(chalk.red(`🗑️  Detected deletion: ${relativePath}. (Manual delete on Supabase required for safety)`));
    // We verwijderen niet automatisch van Supabase om ongelukken te voorkomen (Backup principe)
  });

console.log(chalk.blue('👀 Watchdog is active. Save a file in 1-SITE/assets to trigger sync.'));
