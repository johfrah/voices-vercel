#!/usr/bin/env tsx
/**
 * Test Admin Authentication & Redirect
 * Verifies the admin-key authentication flow
 */

async function testAdminAuth() {
  const url = 'https://www.voices.be/api/auth/admin-key?key=ak_0980d72ab40b410e83dc0c3b933ecc59';
  
  console.log('🔍 Testing Admin Authentication Flow...\n');
  console.log(`URL: ${url}\n`);

  try {
    // First request - follow redirects to handle trailing slash
    let currentUrl = url;
    let response = await fetch(currentUrl, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    // Handle 308 redirect for trailing slash
    if (response.status === 308) {
      const redirectUrl = response.headers.get('location');
      console.log('📍 Handling trailing slash redirect:', redirectUrl);
      
      if (redirectUrl) {
        currentUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://www.voices.be${redirectUrl}`;
        response = await fetch(currentUrl, {
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });
      }
    }

    console.log('📊 Response Status:', response.status);
    console.log('📍 Redirect Location:', response.headers.get('location'));
    
    // Check for Set-Cookie header
    const setCookie = response.headers.get('set-cookie');
    console.log('🍪 Set-Cookie:', setCookie ? 'Present' : 'Missing');
    
    if (response.status === 302 || response.status === 307) {
      const redirectLocation = response.headers.get('location');
      
      if (redirectLocation === '/admin/live-chat') {
        console.log('✅ PASS: Redirects to /admin/live-chat');
      } else {
        console.log(`❌ FAIL: Redirects to ${redirectLocation} instead of /admin/live-chat`);
      }
    } else if (response.status === 200) {
      const text = await response.text();
      if (text.includes('Unauthorized') || text.includes('Login')) {
        console.log('❌ FAIL: Shows Unauthorized/Login screen');
      } else {
        console.log('⚠️  WARNING: Status 200 but expected redirect');
      }
    } else {
      console.log(`❌ FAIL: Unexpected status ${response.status}`);
    }

    // Now test the protected page with the cookie
    if (setCookie) {
      console.log('\n🔐 Testing protected page access...');
      
      const protectedResponse = await fetch('https://www.voices.be/admin/live-chat', {
        headers: {
          'Cookie': setCookie,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      console.log('📊 Protected Page Status:', protectedResponse.status);
      
      if (protectedResponse.status === 200) {
        const html = await protectedResponse.text();
        
        // Check for key elements
        const hasLiveChatWatcher = html.includes('Live Chat Watcher') || html.includes('Conversaties');
        const hasUnauthorized = html.includes('Unauthorized');
        const hasLogin = html.includes('Login');
        
        console.log('🔍 Page Content Check:');
        console.log('  - Live Chat Watcher interface:', hasLiveChatWatcher ? '✅ Found' : '❌ Not found');
        console.log('  - Unauthorized message:', hasUnauthorized ? '❌ Found (BAD)' : '✅ Not found');
        console.log('  - Login screen:', hasLogin ? '❌ Found (BAD)' : '✅ Not found');
        
        if (hasLiveChatWatcher && !hasUnauthorized && !hasLogin) {
          console.log('\n✅ OVERALL: Authentication flow working correctly');
        } else {
          console.log('\n❌ OVERALL: Authentication flow has issues');
        }
      } else {
        console.log(`❌ FAIL: Protected page returned status ${protectedResponse.status}`);
      }
    }

  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

testAdminAuth();
