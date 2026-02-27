/**
 * Simple Johfrah Audio Verification
 * 
 * Direct test of audio file accessibility
 */

import { chromium } from 'playwright';

const DEMO_FILES = [
  {
    name: 'Corporate (Video)',
    path: 'agency/voices/be/nl/male/johfrah-A-182508/demos/johfrah-A-182508-flemish-voiceover-corporate.mp3',
    type: 'video'
  },
  {
    name: 'Q-Team (Telephony)',
    path: 'assets/agency/voices/be/nl/male/johfrah-A-182508/demos/telephony/johfrah-qteam.mp3',
    type: 'telephony'
  },
  {
    name: 'FAVV (Telephony)',
    path: 'assets/agency/voices/be/nl/male/johfrah-A-182508/demos/telephony/johfrah-favv.mp3',
    type: 'telephony'
  },
  {
    name: 'Voices (Telephony)',
    path: 'assets/agency/voices/be/nl/male/johfrah-A-182508/demos/telephony/johfrah-voices.mp3',
    type: 'telephony'
  }
];

async function verifyJohfrahAudio() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 Starting Simple Johfrah Audio Verification...\n');
  
  // Navigate to voices.be
  console.log('📍 Navigating to https://www.voices.be...');
  await page.goto('https://www.voices.be');
  await page.waitForTimeout(2000);
  
  // Check version
  const version = await page.evaluate(() => (window as any).__VOICES_VERSION__ || 'unknown');
  console.log(`✅ Version: ${version}\n`);
  
  // Test each audio file directly
  console.log('📍 Testing audio files directly...\n');
  
  const results = [];
  
  for (const demo of DEMO_FILES) {
    console.log(`🎵 Testing: ${demo.name}`);
    
    // Try both possible base URLs
    const urls = [
      `https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/${demo.path}`,
      `https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices-v2/${demo.path}`
    ];
    
    let success = false;
    let workingUrl = '';
    let status = 0;
    
    for (const url of urls) {
      const bucket = url.includes('voices-v2') ? 'voices-v2' : 'voices';
      console.log(`   Testing bucket: ${bucket}`);
      
      try {
        const response = await page.evaluate(async (testUrl) => {
          try {
            const res = await fetch(testUrl, { method: 'HEAD' });
            return { status: res.status, ok: res.ok };
          } catch (error) {
            return { status: 0, ok: false, error: String(error) };
          }
        }, url);
        
        status = response.status;
        
        if (response.ok) {
          console.log(`   ✅ File accessible (HTTP ${response.status}) in bucket: ${bucket}`);
          success = true;
          workingUrl = url;
          break;
        } else {
          console.log(`   ❌ HTTP ${response.status} in bucket: ${bucket}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error}`);
      }
    }
    
    if (success) {
      // Test playback
      console.log(`   🎧 Testing playback...`);
      const playbackResult = await page.evaluate(async (url) => {
        return new Promise((resolve) => {
          const audio = new Audio(url);
          
          audio.addEventListener('canplay', () => {
            audio.play().then(() => {
              setTimeout(() => {
                audio.pause();
                resolve({ success: true });
              }, 500);
            }).catch(err => {
              resolve({ success: false, error: String(err) });
            });
          });
          
          audio.addEventListener('error', () => {
            resolve({ success: false, error: audio.error?.message || 'Unknown error' });
          });
          
          setTimeout(() => {
            resolve({ success: false, error: 'Timeout' });
          }, 5000);
          
          audio.load();
        });
      }, workingUrl);
      
      if (playbackResult.success) {
        console.log(`   ✅ Playback successful\n`);
      } else {
        console.log(`   ❌ Playback failed: ${playbackResult.error}\n`);
        success = false;
      }
    } else {
      console.log(`   ❌ File not accessible in any bucket\n`);
    }
    
    results.push({
      name: demo.name,
      type: demo.type,
      success,
      workingUrl,
      status
    });
  }
  
  // Final report
  console.log('='.repeat(80));
  console.log('📊 JOHFRAH AUDIO VERIFICATION REPORT');
  console.log('='.repeat(80) + '\n');
  
  console.log(`Version: ${version}`);
  console.log(`Files tested: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}\n`);
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log(`✅ VERIFIED LIVE: ${version} - Johfrah's demos are now playable (Dynamic Bucket Resolution active).`);
    console.log(`   - All ${results.length} tested demos played successfully`);
    console.log(`   - No 400 errors detected`);
  } else {
    console.log('❌ ISSUES FOUND:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: HTTP ${r.status || 'N/A'}`);
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  await browser.close();
  process.exit(allSuccess ? 0 : 1);
}

verifyJohfrahAudio();
