
import * as fs from 'fs';
import * as path from 'path';

const sqlPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/ID348299_voices (2).sql';
const mdPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/VOICE-ACTORS-MATCHING.md';
const legacyUploadsBase = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/legacy-uploads';

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
    return f.replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\\\'/g, "'").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\\\r\\\\n/g, "\n").replace(/\\\\n/g, "\n");
  });
}

function getLocalPath(url: string): string {
  if (!url) return "";
  const match = url.match(/wp-content\/uploads\/(.+)$/);
  if (match) {
    const relativePath = match[1].split('?')[0]; // Remove query params
    const fullPath = path.join(legacyUploadsBase, relativePath);
    if (fs.existsSync(fullPath)) {
      return `4-KELDER/legacy-uploads/${relativePath}`;
    }
  }
  return "";
}

function parsePHPSerializedDemos(serialized: string): { name: string, url: string }[] {
  if (!serialized || !serialized.startsWith('a:')) return [];
  const demos: { name: string, url: string }[] = [];
  
  // Simple regex-based parser for the specific structure we saw
  // s:16:"phone-demos-name";s:11:"Voices Demo";s:15:"phone-demos-url";s:73:"..."
  const items = serialized.split('s:6:"item-');
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    const nameMatch = item.match(/-name";s:\d+:"([^"]+)"/);
    const urlMatch = item.match(/-url";s:\d+:"([^"]+)"/);
    if (urlMatch) {
      demos.push({
        name: nameMatch ? nameMatch[1] : "Onbekende Demo",
        url: urlMatch[1]
      });
    }
  }
  return demos;
}

async function main() {
  console.log("🚀 Extracting full actor dossiers with local file mapping...");
  
  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const actors = [];
  const lines = rawMd.split('\n');
  for (const line of lines) {
    const match = line.match(/## \[(\d+)\] ([^|]+)/);
    if (match) {
      const actorId = match[1];
      const firstName = match[2].trim();
      let email = "";
      let wpId = "";
      const currentIndex = lines.indexOf(line);
      for (let i = currentIndex + 1; i < currentIndex + 5; i++) {
        if (lines[i]?.includes("- **Email**:")) email = lines[i].match(/`([^`]+)`/)?.[1] || "";
        if (lines[i]?.includes("- **WooCommerce ID**:")) wpId = lines[i].match(/`([^`]+)`/)?.[1] || "";
      }
      if (wpId) actors.push({ actorId, wpId, firstName, email });
    }
  }

  const wpIds = actors.map(a => a.wpId);
  const postsMap = new Map();
  const metaMap = new Map();
  const attachmentUrls = new Map();
  const { execSync } = require('child_process');

  console.log("Reading wp_posts...");
  const postsTempFile = '/tmp/wp_posts_full.txt';
  execSync(`grep "'product'" "${sqlPath}" | grep "^(" > ${postsTempFile}`);
  const postsLines = fs.readFileSync(postsTempFile, 'utf8').split('\n');
  for (const line of postsLines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    if (fields.length >= 20 && wpIds.includes(fields[0])) {
      postsMap.set(fields[0], { whyVoices: fields[4], tagline: fields[6] });
    }
  }

  console.log("Reading wp_postmeta...");
  const metaTempFile = '/tmp/wp_postmeta_full.txt';
  execSync(`grep -E "'about-me'|'_thumbnail_id'|'demo'|'voice-over-demos'|'phone-demos'|'logo-brand'|'voice-header'" "${sqlPath}" > ${metaTempFile}`);
  const metaLines = fs.readFileSync(metaTempFile, 'utf8').split('\n');
  for (const line of metaLines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    if (fields.length >= 4 && wpIds.includes(fields[1])) {
      const wpId = fields[1];
      if (!metaMap.has(wpId)) metaMap.set(wpId, { phoneDemos: [], voDemos: [] });
      const data = metaMap.get(wpId);
      if (fields[2] === 'about-me') data.bio = fields[3];
      if (fields[2] === '_thumbnail_id') data.thumbId = fields[3];
      if (fields[2] === 'demo') data.mainDemo = fields[3];
      if (fields[2] === 'logo-brand') data.logoBrandId = fields[3];
      if (fields[2] === 'voice-header') data.headerId = fields[3];
      if (fields[2] === 'phone-demos') data.phoneDemos = parsePHPSerializedDemos(fields[3]);
      if (fields[2] === 'voice-over-demos') data.voDemos = parsePHPSerializedDemos(fields[3]);
    }
  }

  console.log("Reading attachments...");
  const attachmentsTempFile = '/tmp/wp_attachments_full.txt';
  execSync(`grep "'attachment'" "${sqlPath}" > ${attachmentsTempFile}`);
  const attachLines = fs.readFileSync(attachmentsTempFile, 'utf8').split('\n');
  for (const line of attachLines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    if (fields.length >= 20 && fields[20] === 'attachment') {
      attachmentUrls.set(fields[0], fields[18]);
    }
  }

  let newMd = "# 🎭 Voice Actors Master Dossier (Offline Sync)\n\n";
  newMd += "Dit bestand bevat het volledige dossier per stem inclusief lokale paden naar de legacy-uploads.\n\n";
  newMd += "---\n\n";

  const cleanText = (text: string) => {
    if (!text) return "";
    return text.replace(/\\'/g, "'").replace(/\\\\'/g, "'").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").trim();
  };

  for (const actor of actors) {
    const postData = postsMap.get(actor.wpId) || { tagline: "", whyVoices: "" };
    const metaData = metaMap.get(actor.wpId) || { phoneDemos: [], voDemos: [] };
    
    const photoUrl = metaData.thumbId ? attachmentUrls.get(metaData.thumbId) : "";
    const logoUrl = metaData.logoBrandId ? attachmentUrls.get(metaData.logoBrandId) : "";
    const headerUrl = metaData.headerId ? attachmentUrls.get(metaData.headerId) : "";

    newMd += `## [${actor.actorId}] ${actor.firstName}\n\n`;
    newMd += `- **Email**: \`${actor.email}\`\n`;
    newMd += `- **WooCommerce ID**: \`${actor.wpId}\`\n`;
    newMd += `- **Tagline**: *${cleanText(postData.tagline) || "Geen tagline gevonden"}*\n\n`;
    
    newMd += "### 📸 Media & Branding\n";
    if (photoUrl) {
      const local = getLocalPath(photoUrl);
      newMd += `- **Profielfoto**: [Online](${photoUrl}) ${local ? `| **Lokaal**: \`${local}\`` : "| ❌ *Niet lokaal gevonden*"}\n`;
    }
    if (logoUrl) {
      const local = getLocalPath(logoUrl);
      newMd += `- **Logo Brand**: [Online](${logoUrl}) ${local ? `| **Lokaal**: \`${local}\`` : "| ❌ *Niet lokaal gevonden*"}\n`;
    }
    if (headerUrl) {
      const local = getLocalPath(headerUrl);
      newMd += `- **Header Image**: [Online](${headerUrl}) ${local ? `| **Lokaal**: \`${local}\`` : "| ❌ *Niet lokaal gevonden*"}\n`;
    }
    newMd += "\n";

    newMd += "### 🎙️ Audio Gallery\n";
    if (metaData.mainDemo) {
      const local = getLocalPath(metaData.mainDemo);
      newMd += `- **Hoofddemo**: [Online](${metaData.mainDemo}) ${local ? `| **Lokaal**: \`${local}\`` : "| ❌ *Niet lokaal gevonden*"}\n`;
    }
    
    if (metaData.phoneDemos.length > 0) {
      newMd += "\n**Phone Demos (IVR):**\n";
      for (const demo of metaData.phoneDemos) {
        const local = getLocalPath(demo.url);
        newMd += `- ${demo.name}: [Online](${demo.url}) ${local ? `| **Lokaal**: \`${local}\`` : "| ❌ *Niet lokaal gevonden*"}\n`;
      }
    }
    
    if (metaData.voDemos.length > 0) {
      newMd += "\n**Voice-over Demos:**\n";
      for (const demo of metaData.voDemos) {
        const local = getLocalPath(demo.url);
        newMd += `- ${demo.name}: [Online](${demo.url}) ${local ? `| **Lokaal**: \`${local}\`` : "| ❌ *Niet lokaal gevonden*"}\n`;
      }
    }
    newMd += "\n";

    newMd += "### 💡 Why Voices (IVR/Company)\n";
    newMd += `${cleanText(postData.whyVoices) || "_Geen Why Voices tekst_"}\n\n`;
    
    newMd += "### 📖 Bio\n";
    newMd += `${cleanText(metaData.bio) || "_Geen bio gevonden_"}\n\n`;
    newMd += "---\n\n";
  }

  fs.writeFileSync(mdPath, newMd);
  console.log("✅ Updated VOICE-ACTORS-MATCHING.md with Local Paths and Full Media Gallery.");
}

main();
