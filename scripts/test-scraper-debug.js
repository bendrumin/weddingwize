// Test script to debug what's happening in the scraper
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testScraperDebug() {
  console.log('🔍 Testing scraper debug - checking what we can actually scrape...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Test The Knot
    console.log('\n🎯 Testing The Knot...');
    const knotUrl = 'https://www.theknot.com/marketplace/wedding-venues/san-francisco-ca';
    console.log(`URL: ${knotUrl}`);
    
    try {
      await page.goto(knotUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const content = await page.content();
      const $ = cheerio.load(content);
      
      console.log(`✅ The Knot loaded, content length: ${content.length}`);
      console.log(`Title: ${$('title').text()}`);
      
      // Check for blocking
      if (content.includes('blocked') || content.includes('captcha') || content.includes('access denied')) {
        console.log('❌ The Knot appears to be blocking us');
      } else {
        console.log('✅ The Knot is accessible');
        
        // Try to find venue cards
        const selectors = [
          '[data-testid="vendor-card"]',
          '.vendor-card',
          '.listing-card',
          '.venue-card',
          '.business-card',
          '.search-result',
          '.result-item'
        ];
        
        for (const selector of selectors) {
          const elements = $(selector);
          if (elements.length > 0) {
            console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
            // Show first element content
            console.log(`First element HTML: ${$(elements[0]).html()?.substring(0, 200)}...`);
            break;
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Error with The Knot: ${error.message}`);
    }
    
    // Test WeddingWire
    console.log('\n🎯 Testing WeddingWire...');
    const weddingWireUrl = 'https://www.weddingwire.com/wedding-venues/san-francisco-ca';
    console.log(`URL: ${weddingWireUrl}`);
    
    try {
      await page.goto(weddingWireUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const content = await page.content();
      const $ = cheerio.load(content);
      
      console.log(`✅ WeddingWire loaded, content length: ${content.length}`);
      console.log(`Title: ${$('title').text()}`);
      
      // Check for blocking
      if (content.includes('blocked') || content.includes('captcha') || content.includes('access denied')) {
        console.log('❌ WeddingWire appears to be blocking us');
      } else {
        console.log('✅ WeddingWire is accessible');
        
        // Try to find venue cards
        const selectors = [
          '.vendor-card',
          '.listing-card',
          '.business-card',
          '.venue-card',
          '[data-testid="vendor-card"]',
          '.search-result',
          '.result-item'
        ];
        
        for (const selector of selectors) {
          const elements = $(selector);
          if (elements.length > 0) {
            console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
            // Show first element content
            console.log(`First element HTML: ${$(elements[0]).html()?.substring(0, 200)}...`);
            break;
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Error with WeddingWire: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error in scraper debug:', error);
  } finally {
    await browser.close();
  }
}

testScraperDebug()
  .then(() => {
    console.log('\n✅ Scraper debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Scraper debug failed:', error);
    process.exit(1);
  });
