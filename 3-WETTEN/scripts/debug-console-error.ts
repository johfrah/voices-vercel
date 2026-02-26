import { chromium } from 'playwright';

async function debugConsoleError() {
  console.log('🔍 Opening https://www.voices.be in browser...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: Array<{
    message: string;
    stack?: string;
    source?: string;
    line?: number;
    column?: number;
  }> = [];

  // Capture console errors with full details
  page.on('console', (msg) => {
    const text = msg.text();
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  // Capture page errors with stack traces
  page.on('pageerror', (error) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      source: error.stack?.split('\n')[1]?.trim(),
      line: undefined as number | undefined,
      column: undefined as number | undefined,
    };

    // Try to extract line and column from stack
    const stackMatch = error.stack?.match(/at\s+.*?(\d+):(\d+)/);
    if (stackMatch) {
      errorDetails.line = parseInt(stackMatch[1]);
      errorDetails.column = parseInt(stackMatch[2]);
    }

    errors.push(errorDetails);
    
    console.error('\n❌ PAGE ERROR DETECTED:\n');
    console.error('Message:', error.message);
    console.error('\nFull Stack Trace:');
    console.error(error.stack);
    console.error('\n' + '='.repeat(80) + '\n');
  });

  // Also capture runtime errors from the page context
  await page.addInitScript(() => {
    const originalError = window.console.error;
    window.console.error = function(...args) {
      originalError.apply(console, args);
      // This will be captured by the console listener
    };
  });

  try {
    console.log('🌐 Navigating to https://www.voices.be...\n');
    
    // Navigate and perform hard refresh
    await page.goto('https://www.voices.be', { 
      waitUntil: 'domcontentloaded',
    });

    // Perform hard refresh (Cmd+Shift+R equivalent)
    console.log('🔄 Performing hard refresh...\n');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for any async errors to appear
    console.log('⏳ Waiting for errors to surface...\n');
    await page.waitForTimeout(5000);

    // Try to evaluate any runtime errors in the page context
    const runtimeErrors = await page.evaluate(() => {
      const errors: string[] = [];
      // Check if there are any global error handlers that caught something
      if ((window as any).__errors) {
        errors.push(...(window as any).__errors);
      }
      return errors;
    });

    if (runtimeErrors.length > 0) {
      console.log('🔍 Runtime errors found:', runtimeErrors);
    }

    console.log('\n📊 SUMMARY:\n');
    console.log(`Total page errors captured: ${errors.length}\n`);

    if (errors.length > 0) {
      console.log('🚨 DETAILED ERROR ANALYSIS:\n');
      
      errors.forEach((error, index) => {
        console.log(`\n--- ERROR #${index + 1} ---`);
        console.log('Message:', error.message);
        
        if (error.stack) {
          console.log('\nStack Trace:');
          console.log(error.stack);
          
          // Try to extract chunk/file names
          const chunkMatches = error.stack.match(/(\d+-[a-f0-9]+\.js)/g);
          if (chunkMatches) {
            console.log('\n📦 Chunks involved:', [...new Set(chunkMatches)]);
          }
          
          // Extract line numbers
          const lineMatches = error.stack.match(/:(\d+):(\d+)/g);
          if (lineMatches) {
            console.log('📍 Line:Column references:', lineMatches);
          }
        }
        
        console.log('\n' + '-'.repeat(80));
      });

      // Check for the specific TypeError
      const lengthError = errors.find(err => 
        err.message.includes("Cannot read properties of undefined (reading 'length')")
      );

      if (lengthError) {
        console.log('\n🎯 TARGET ERROR FOUND:\n');
        console.log('Message:', lengthError.message);
        console.log('\nFull Stack:');
        console.log(lengthError.stack);
        
        // Parse the stack to find the exact location
        if (lengthError.stack) {
          const lines = lengthError.stack.split('\n');
          console.log('\n📍 EXACT LOCATION:\n');
          lines.slice(0, 5).forEach(line => console.log(line));
        }
      } else {
        console.log('\n✅ The specific TypeError about "length" was NOT found');
      }
    } else {
      console.log('✅ No page errors detected!');
    }

    // Take a screenshot
    const screenshotPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/scripts/console-error-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot saved to: ${screenshotPath}`);

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 60 seconds for manual inspection...');
    console.log('💡 Open DevTools (F12) to see the console and click on errors to expand stack traces\n');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await browser.close();
  }
}

debugConsoleError();
