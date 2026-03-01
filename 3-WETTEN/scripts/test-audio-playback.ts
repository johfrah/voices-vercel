#!/usr/bin/env tsx
/**
 * 🛡️ CHRIS-PROTOCOL: Audio Playback Forensic Test
 * 
 * Dit script test de audio-playback op de live site door:
 * 1. De database te scannen op acteurs met lege audio_urls (die via media_id moeten laden)
 * 2. De proxy-route te testen met verschillende paden
 * 3. De stream-route te testen voor demos
 */

import { db } from '../../1-SITE/packages/database/src/index';
import { sql } from 'drizzle-orm';

async function testAudioPlayback() {
  console.log('🎯 AUDIO PLAYBACK FORENSIC TEST\n');

  // 1. Scan database voor demos met lege audio_urls
  console.log('📊 Scanning database for demos with empty audio_urls...\n');
  
  const result = await db.execute(sql`
    SELECT 
      d.id,
      d.title,
      d.audio_url,
      d.media_id,
      a.first_name,
      a.last_name,
      a.status,
      a.is_public
    FROM voice_demos d
    JOIN voice_actors a ON d.actor_id = a.id
    WHERE a.status = 'live' 
      AND a.is_public = true
      AND (d.audio_url IS NULL OR d.audio_url = '')
    LIMIT 10
  `);

  console.log(`Found ${result.rows.length} demos with empty audio_urls:\n`);
  
  for (const row of result.rows) {
    console.log(`  - Demo #${row.id}: "${row.title}"`);
    console.log(`    Actor: ${row.first_name} ${row.last_name}`);
    console.log(`    audio_url: ${row.audio_url || '(empty)'}`);
    console.log(`    media_id: ${row.media_id || '(empty)'}`);
    console.log('');
  }

  // 2. Test de stream-route voor de eerste demo
  if (result.rows.length > 0) {
    const testDemo = result.rows[0];
    console.log(`\n🧪 Testing stream route for demo #${testDemo.id}...\n`);
    
    const streamUrl = `https://www.voices.be/api/admin/actors/demos/${testDemo.id}/stream`;
    console.log(`  Stream URL: ${streamUrl}`);
    
    try {
      const response = await fetch(streamUrl);
      console.log(`  Status: ${response.status} ${response.statusText}`);
      console.log(`  Content-Type: ${response.headers.get('content-type')}`);
      console.log(`  Content-Length: ${response.headers.get('content-length')}`);
      
      if (response.ok) {
        console.log('  ✅ Stream route is working!');
      } else {
        console.log('  ❌ Stream route failed!');
        const text = await response.text();
        console.log(`  Error: ${text.substring(0, 200)}`);
      }
    } catch (error: any) {
      console.log(`  ❌ Network error: ${error.message}`);
    }
  }

  // 3. Scan voor demos MET audio_urls die via proxy moeten laden
  console.log('\n\n📊 Scanning for demos WITH audio_urls (proxy test)...\n');
  
  const proxyResult = await db.execute(sql`
    SELECT 
      d.id,
      d.title,
      d.audio_url,
      a.first_name,
      a.last_name
    FROM voice_demos d
    JOIN voice_actors a ON d.actor_id = a.id
    WHERE a.status = 'live' 
      AND a.is_public = true
      AND d.audio_url IS NOT NULL 
      AND d.audio_url != ''
    LIMIT 5
  `);

  console.log(`Found ${proxyResult.rows.length} demos with audio_urls:\n`);
  
  for (const row of proxyResult.rows) {
    console.log(`  - Demo #${row.id}: "${row.title}"`);
    console.log(`    Actor: ${row.first_name} ${row.last_name}`);
    console.log(`    audio_url: ${row.audio_url}`);
    
    // Test of de URL via proxy moet
    if (row.audio_url && !row.audio_url.startsWith('http')) {
      const proxyUrl = `https://www.voices.be/api/proxy/?path=${encodeURIComponent(row.audio_url)}`;
      console.log(`    Proxy URL: ${proxyUrl}`);
      
      try {
        const response = await fetch(proxyUrl, { method: 'HEAD' });
        console.log(`    Proxy Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('    ✅ Proxy route is working!');
        } else {
          console.log('    ❌ Proxy route failed!');
        }
      } catch (error: any) {
        console.log(`    ❌ Network error: ${error.message}`);
      }
    }
    
    console.log('');
  }

  console.log('\n✅ Audio playback forensic test complete.\n');
}

testAudioPlayback().catch(console.error);
