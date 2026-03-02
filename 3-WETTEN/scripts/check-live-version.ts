#!/usr/bin/env tsx
/**
 * Check Live Version Script
 * Validates the deployed version on voices.be
 */

async function checkLiveVersion() {
  const maxRetries = 3;
  const retryDelay = 30000; // 30 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n🔍 Attempt ${attempt}/${maxRetries}: Checking live version...`);
      
      const response = await fetch('https://www.voices.be/api/admin/config', {
        method: 'GET',
        headers: {
          'User-Agent': 'Voices-Forensic-Audit/1.0',
          'Accept': 'application/json',
        },
        redirect: 'follow',
      });

      console.log(`📡 Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`\n✅ LIVE VERSION DETECTED:`);
        console.log(JSON.stringify(data, null, 2));
        return data;
      } else if (response.status === 401) {
        console.log(`⚠️  Endpoint requires authentication (401)`);
        console.log(`   Trying alternative method...`);
        
        // Try to fetch the main page and look for version in scripts
        const pageResponse = await fetch('https://www.voices.be/', {
          headers: {
            'User-Agent': 'Voices-Forensic-Audit/1.0',
          },
        });
        
        const html = await pageResponse.text();
        
        // Look for version in Next.js build ID or meta tags
        const buildIdMatch = html.match(/_buildManifest\.js\?v=([a-zA-Z0-9]+)/);
        const versionMatch = html.match(/version["\s:]+["']?([0-9]+\.[0-9]+\.[0-9]+)/i);
        
        if (versionMatch) {
          console.log(`\n✅ VERSION FOUND IN HTML: ${versionMatch[1]}`);
          return { version: versionMatch[1], source: 'html' };
        }
        
        if (buildIdMatch) {
          console.log(`\n📦 Build ID: ${buildIdMatch[1]}`);
        }
        
        console.log(`\n⚠️  Could not extract version from HTML`);
      } else {
        console.log(`❌ Unexpected status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 200)}`);
      }

      if (attempt < maxRetries) {
        console.log(`\n⏳ Waiting ${retryDelay/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      console.error(`❌ Error on attempt ${attempt}:`, error);
      if (attempt < maxRetries) {
        console.log(`\n⏳ Waiting ${retryDelay/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.log(`\n❌ Failed to retrieve version after ${maxRetries} attempts`);
  return null;
}

// Run the check
checkLiveVersion().then(result => {
  if (result) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
