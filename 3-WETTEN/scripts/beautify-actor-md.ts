
import * as fs from 'fs';

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
  console.log("🚀 Re-extracting and beautifying actor data...");
  
  // We halen de basislijst opnieuw op om zeker te zijn van de volgorde
  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const actors = [];
  const lines = rawMd.split('\n');
  for (const line of lines) {
    const match = line.match(/\| (\d+) \| (\d+) \| ([^|]+) \| ([^|]+) \|/);
    if (match) {
      actors.push({
        actorId: match[1],
        wpId: match[2],
        firstName: match[3].trim(),
        email: match[4].trim()
      });
    }
  }

  const wpIds = actors.map(a => a.wpId);
  const postsMap = new Map();
  const metaMap = new Map();
  const { execSync } = require('child_process');

  // Posts extractie
  const postsTempFile = '/tmp/wp_posts_beautify.txt';
  execSync(`grep "'product'" "${sqlPath}" | grep "^(" > ${postsTempFile}`);
  const postsLines = fs.readFileSync(postsTempFile, 'utf8').split('\n');
  for (const line of postsLines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    if (fields.length >= 20 && wpIds.includes(fields[0])) {
      postsMap.set(fields[0], {
        whyVoices: fields[4],
        tagline: fields[6],
      });
    }
  }

  // Meta extractie (Bio)
  const metaTempFile = '/tmp/wp_postmeta_beautify.txt';
  execSync(`grep "'about-me'" "${sqlPath}" > ${metaTempFile}`);
  const metaLines = fs.readFileSync(metaTempFile, 'utf8').split('\n');
  for (const line of metaLines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    if (fields.length >= 4 && fields[2] === 'about-me' && wpIds.includes(fields[1])) {
      metaMap.set(fields[1], fields[3]);
    }
  }

  let newMd = "# 🎭 Voice Actors Master Data\n\n";
  newMd += "Dit bestand bevat de broninformatie voor alle stemmen, geëxtraheerd uit de legacy SQL dump. Gebruik dit als referentie voor de publieke profielen.\n\n";
  newMd += "---\n\n";

  for (const actor of actors) {
    const postData = postsMap.get(actor.wpId) || { tagline: "", whyVoices: "" };
    const bio = metaMap.get(actor.wpId) || "";

    newMd += `## [${actor.actorId}] ${actor.firstName}\n\n`;
    newMd += `- **Email**: \`${actor.email}\`\n`;
    newMd += `- **WooCommerce ID**: \`${actor.wpId}\`\n`;
    newMd += `- **Tagline**: *${postData.tagline || "Geen tagline gevonden"}*\n\n`;
    
    newMd += "### 💡 Why Voices (IVR/Company)\n";
    newMd += `${postData.whyVoices || "_Geen Why Voices tekst_"}\n\n`;
    
    newMd += "### 📖 Bio\n";
    newMd += `${bio || "_Geen bio gevonden_"}\n\n`;
    newMd += "---\n\n";
  }

  fs.writeFileSync(mdPath, newMd);
  console.log("✅ Beautified VOICE-ACTORS-MATCHING.md");
}

main();
