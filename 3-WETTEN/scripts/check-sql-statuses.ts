
import * as fs from 'fs';

const sqlPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/ID348299_voices (2).sql';

async function main() {
  const tempFile = '/tmp/actor_status_check.txt';
  const { execSync } = require('child_process');
  execSync(`sed -n '1195681,1196000p' "${sqlPath}" | grep "^(" > ${tempFile}`);
  
  const dataContent = fs.readFileSync(tempFile, 'utf8');
  const statuses = new Map<string, number>();
  
  const lines = dataContent.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    line = line.replace(/[,;]$/, '');
    const content = line.substring(1, line.length - 1);
    const fields = [];
    let currentField = "";
    let inQuotes = false;
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (char === "'" && (i === 0 || content[i-1] !== "\\")) {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(currentField.trim());
        currentField = "";
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());

    if (fields.length >= 28) {
      const status = fields[25].replace(/^'|'$/g, '');
      statuses.set(status, (statuses.get(status) || 0) + 1);
    }
  }
  console.log("📊 Status counts in SQL dump:");
  for (const [status, count] of statuses.entries()) {
    console.log(`- ${status}: ${count}`);
  }
}

main();
