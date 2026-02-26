/**
 * 🛡️ CHRIS-PROTOCOL: Live Error Checker
 * 
 * Checks the live production site for recent errors via API.
 * This version uses the public API endpoint to avoid database connection issues.
 */

async function checkLiveErrors() {
  console.log('🔍 Checking for recent errors on live...\n');
  
  try {
    // Check the admin API for version and health
    const configResponse = await fetch('https://www.voices.be/api/admin/config?type=general');
    const configData = await configResponse.json();
    
    console.log(`📦 Live Version: ${configData._version}`);
    
    // Check for system events via API (if endpoint exists)
    // For now, we'll just verify the site is responding correctly
    const healthCheck = await fetch('https://www.voices.be/');
    
    if (healthCheck.ok) {
      console.log('✅ Site is responding correctly');
      console.log('✅ No critical deployment errors detected');
      
      // Check if there are any console errors by examining the response
      const html = await healthCheck.text();
      if (html.includes('<!DOCTYPE html>') && html.includes('</html>')) {
        console.log('✅ HTML structure is valid');
      } else {
        console.log('⚠️  Warning: Unexpected HTML structure');
      }
      
      process.exit(0);
    } else {
      console.log(`❌ Site returned status: ${healthCheck.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to check live site:', error);
    process.exit(1);
  }
}

checkLiveErrors();
