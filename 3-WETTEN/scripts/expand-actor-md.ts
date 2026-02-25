
import * as fs from 'fs';
import * as path from 'path';

const sqlPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/ID348299_voices (2).sql';
const mdPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/VOICE-ACTORS-MATCHING.md';

function parseSqlLine(line: string) {
  let content = line.trim();
  if (content.endsWith(';')) content = content.slice(0, -1);
  if (content.endsWith(',')) content = content.slice(0, -1);
  if (content.startsWith('(') && content.endsWith(')')) {
    content = content.substring(1, content.length - 1);
  }
  
  const fields = [];
  let currentField = "";
  let inQuotes = false;
  for (let j = 0; j < content.length; j++) {
    const char = content[j];
    if (char === "'" && (j === 0 || content[j-1] !== "\\")) {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      fields.push(currentField.trim());
      currentField = "";
    } else {
      currentField += char;
    }
  }
  fields.push(currentField.trim());
  return fields.map(f => {
    if (f === 'NULL') return null;
    return f.replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
  });
}

async function main() {
  console.log("🚀 Extracting actor data from SQL dump...");
  
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const lines = mdContent.split('\n');
  const actors = [];
  
  // Parse MD table
  for (const line of lines) {
    const match = line.match(/\| (\d+) \| (\d+) \| ([^|]+) \| ([^|]+) \| (\d+|❌[^|]+) \|/);
    if (match) {
      actors.push({
        actorId: match[1],
        wpId: match[2],
        firstName: match[3].trim(),
        email: match[4].trim(),
        supabaseId: match[5].trim()
      });
    }
  }

  console.log(`Found ${actors.length} actors in MD file.`);

  // 1. Extract post_content (Why Voices) and post_excerpt (Tagline) from wp_posts
  const wpIds = actors.map(a => a.wpId);
  const postsMap = new Map();
  
  console.log("Reading wp_posts...");
  const { execSync } = require('child_process');
  const postsTempFile = '/tmp/wp_posts_extract.txt';
  // Filter lines that look like (ID, ... 'product', ...)
  execSync(`grep "'product'" "${sqlPath}" | grep "^(" > ${postsTempFile}`);
  
  const postsLines = fs.readFileSync(postsTempFile, 'utf8').split('\n');
  for (const line of postsLines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    if (fields.length >= 20 && wpIds.includes(fields[0])) {
      postsMap.set(fields[0], {
        whyVoices: fields[4], // post_content
        tagline: fields[6],    // post_excerpt
      });
    }
  }

  // 2. Extract about-me (Bio) from wp_postmeta
  console.log("Reading wp_postmeta for bios...");
  const metaMap = new Map();
  const metaTempFile = '/tmp/wp_postmeta_extract.txt';
  execSync(`grep "'about-me'" "${sqlPath}" > ${metaTempFile}`);
  
  const metaLines = fs.readFileSync(metaTempFile, 'utf8').split('\n');
  for (const line of metaLines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    // wp_postmeta: (meta_id, post_id, meta_key, meta_value)
    if (fields.length >= 4 && fields[2] === 'about-me' && wpIds.includes(fields[1])) {
      metaMap.set(fields[1], fields[3]);
    }
  }

  // 3. Update MD file
  let newMd = "| Actor ID | WooCommerce ID | Voornaam | Email | Tagline | Why Voices | Bio (Fragment) |\n";
  newMd += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";
  
  for (const actor of actors) {
    const postData = postsMap.get(actor.wpId) || { tagline: "", whyVoices: "" };
    const bio = metaMap.get(actor.wpId) || "";
    
    const clean = (text: string) => (text || "").replace(/\|/g, "\\|").replace(/\n/g, " ").substring(0, 150).trim();
    
    newMd += `| ${actor.actorId} | ${actor.wpId} | ${actor.firstName} | ${actor.email} | ${clean(postData.tagline)} | ${clean(postData.whyVoices)} | ${clean(bio)}... |\n`;
  }

  fs.writeFileSync(mdPath, newMd);
  console.log("✅ Updated VOICE-ACTORS-MATCHING.md with expanded info.");
}

main();
