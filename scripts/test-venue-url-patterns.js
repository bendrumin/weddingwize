// Test different WeddingWire URL patterns to find the correct one for venues
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testVenueUrlPatterns() {
  console.log('🔍 Testing different WeddingWire URL patterns for venues...');
  
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
    
    // Test different URL patterns
    const testUrls = [
      'https://www.weddingwire.com/c/ca-california/san-francisco/wedding-venues/10-vendors.html',
      'https://www.weddingwire.com/wedding-venues/san-francisco-ca',
      'https://www.weddingwire.com/wedding-venues/san-francisco-ca/10-vendors.html',
      'https://www.weddingwire.com/c/ca-california/san-francisco/wedding-venues/',
      'https://www.weddingwire.com/wedding-venues/ca/san-francisco/',
      'https://www.weddingwire.com/venues/san-francisco-ca',
      'https://www.weddingwire.com/wedding-venues/san-francisco-ca/10-vendors.html'
    ];
    
    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i];
      console.log(`\n🎯 Testing URL ${i + 1}/${testUrls.length}: ${url}`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const content = await page.content();
        const $ = cheerio.load(content);
        
        console.log(`  Content length: ${content.length}`);
        console.log(`  Title: ${$('title').text()}`);
        
        // Check if it's actually about venues
        const title = $('title').text().toLowerCase();
        const isVenuePage = title.includes('venue') || title.includes('location') || title.includes('hall');
        const isPhotographerPage = title.includes('photographer') || title.includes('photo');
        
        if (isVenuePage && !isPhotographerPage) {
          console.log(`  ✅ This appears to be a VENUE page!`);
          
          // Try to find venue cards
          const selectors = [
            '.vendor-card',
            '.listing-card',
            '.business-card',
            '.venue-card',
            '[data-testid="vendor-card"]',
            '.search-result',
            '.result-item',
            '.vendor-listing',
            '.listing-item'
          ];
          
          for (const selector of selectors) {
            const elements = $(selector);
            if (elements.length > 0) {
              console.log(`  ✅ Found ${elements.length} venues with selector: ${selector}`);
              break;
            }
          }
        } else if (isPhotographerPage) {
          console.log(`  ❌ This is a PHOTOGRAPHER page, not venues`);
        } else {
          console.log(`  ❓ Unknown page type`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Error testing venue URL patterns:', error);
  } finally {
    await browser.close();
  }
}

testVenueUrlPatterns()
  .then(() => {
    console.log('\n✅ Venue URL pattern test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Venue URL pattern test failed:', error);
    process.exit(1);
  });
