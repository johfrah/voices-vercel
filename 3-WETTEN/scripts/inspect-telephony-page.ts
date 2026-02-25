
import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- Navigating to /johfrah/telephony ---');
  try {
    await page.goto('https://www.voices.be/johfrah/telephony', { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch (e) {
    console.log('Navigation timed out, but proceeding to check content.');
  }
  
  const content = await page.content();
  console.log('--- Page Title ---');
  console.log(await page.title());
  
  console.log('--- Checking for "Oeps" or "Configurator laden" ---');
  const hasOeps = content.includes('Oeps');
  const hasLoading = content.includes('Configurator laden');
  console.log(`Has "Oeps": ${hasOeps}`);
  console.log(`Has "Configurator laden": ${hasLoading}`);
  
  console.log('--- Form Elements ---');
  const textareas = await page.$$eval('textarea', els => els.length);
  const buttons = await page.$$eval('button', els => els.length);
  console.log(`Textareas: ${textareas}`);
  console.log(`Buttons: ${buttons}`);
  
  console.log('--- Body Text (First 1000 chars) ---');
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log(bodyText.substring(0, 1000));

  await browser.close();
}

inspect().catch(console.error);
