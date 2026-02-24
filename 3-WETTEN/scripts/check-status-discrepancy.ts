
import * as fs from 'fs';

const sqlPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/ID348299_voices (2).sql';

function parseSqlLine(line) {
  let content = line.trim();
  // Remove trailing semicolon
  if (content.endsWith(';')) content = content.slice(0, -1);
  // Remove trailing comma if it's there
  if (content.endsWith(',')) content = content.slice(0, -1);
  // Remove outer parentheses
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
    return f.replace(/^'|'$/g, '');
  });
}

async function main() {
  const tempFile = '/tmp/actor_data_check.txt';
  const { execSync } = require('child_process');
  execSync(`sed -n '1195681,1196000p' "${sqlPath}" | grep "^(" > ${tempFile}`);
  
  const dataContent = fs.readFileSync(tempFile, 'utf8');
  const actors = [];
  
  const lines = dataContent.split('\n');
  for (let line of lines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    if (fields.length >= 28) {
      actors.push({
        id: fields[0],
        firstName: fields[1],
        email: fields[3].toLowerCase(),
        statusInTable: fields[25]
      });
    }
  }

  // Get email to WP ID mapping
  const mappingFile = '/tmp/email_mapping.txt';
  execSync(`grep "'voice-email'" "${sqlPath}" > ${mappingFile}`);
  const mappingContent = fs.readFileSync(mappingFile, 'utf8');
  const emailToWpMap = new Map();
  const mappingLines = mappingContent.split('\n');
  for (const line of mappingLines) {
    if (!line.trim()) continue;
    const fields = parseSqlLine(line);
    // wp_postmeta: (meta_id, post_id, meta_key, meta_value)
    if (fields.length >= 4 && fields[2] === 'voice-email') {
      emailToWpMap.set(fields[3].toLowerCase(), fields[1]);
    }
  }
  console.log(`✅ Found ${emailToWpMap.size} email-to-WP mappings.`);
  console.log("Sample mappings:", Array.from(emailToWpMap.entries()).slice(0, 5));

  // Get post_status from wp_posts
  console.log("📂 Extracting post_status from wp_posts...");
  const postStatusMap = new Map();
  const wpIdsSet = new Set(emailToWpMap.values());
  
  const postsTempFile = '/tmp/all_posts_lines.txt';
  // Just grep for lines starting with ( and containing 'product'
  execSync(`grep -E "^\\\\(" "${sqlPath}" | grep "'product'" > ${postsTempFile}`);
  
  const postsLines = fs.readFileSync(postsTempFile, 'utf8').split('\n');
  for (const line of postsLines) {
    if (!line.trim()) continue;
    const idMatch = line.match(/^\((\d+),/);
    if (idMatch && wpIdsSet.has(idMatch[1])) {
      const fields = parseSqlLine(line);
      if (fields.length >= 8) {
        postStatusMap.set(fields[0], fields[7]);
      }
    }
  }

  console.log("\n🔍 Analyzing status discrepancies:");
  let liveInBoth = 0;
  let liveInTableButNotPost = 0;
  let noWpMatch = 0;
  let publishCount = 0;
  let privateCount = 0;
  let trashCount = 0;
  let draftCount = 0;

  for (const actor of actors) {
    const wpId = emailToWpMap.get(actor.email);
    if (!wpId) {
      if (noWpMatch < 5) console.log(`❌ No mapping for ${actor.firstName} (${actor.email})`);
      noWpMatch++;
      continue;
    }
    const postStatus = postStatusMap.get(wpId);
    if (noWpMatch < 5) console.log(`✅ Found mapping for ${actor.firstName} (${actor.email}) -> ${wpId} (Status: ${postStatus})`);
    if (postStatus === 'publish') publishCount++;
    else if (postStatus === 'private') privateCount++;
    else if (postStatus === 'trash') trashCount++;
    else if (postStatus === 'draft') draftCount++;

    if (actor.statusInTable === 'live' && postStatus === 'publish') {
      liveInBoth++;
    } else if (actor.statusInTable === 'live' && postStatus !== 'publish') {
      liveInTableButNotPost++;
      console.log(`⚠️ ${actor.firstName} (${actor.email}): Table=live, PostStatus=${postStatus || 'unknown'} (WP ID: ${wpId})`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`- Total actors in table: ${actors.length}`);
  console.log(`- Publish: ${publishCount}`);
  console.log(`- Private: ${privateCount}`);
  console.log(`- Draft: ${draftCount}`);
  console.log(`- Trash: ${trashCount}`);
  console.log(`- Live in both: ${liveInBoth}`);
  console.log(`- Live in table but NOT in posts: ${liveInTableButNotPost}`);
  console.log(`- No WooCommerce match: ${noWpMatch}`);
}

main();
