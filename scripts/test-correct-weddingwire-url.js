// Test the correct WeddingWire URL pattern
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testCorrectWeddingWireUrl() {
  console.log('🔍 Testing correct WeddingWire URL pattern...');
  
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
    
    // Test the correct WeddingWire URL pattern for venues
    const url = 'https://www.weddingwire.com/c/ca-california/san-francisco/wedding-venues/10-vendors.html';
    console.log(`Testing URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const content = await page.content();
    const $ = cheerio.load(content);
    
    console.log(`Page loaded, content length: ${content.length}`);
    console.log(`Title: ${$('title').text()}`);
    
    // Check if we got blocked or redirected
    if (content.includes('blocked') || content.includes('captcha') || content.includes('access denied')) {
      console.log('❌ Appears to be blocked');
    } else {
      console.log('✅ Page is accessible');
      
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
      
      let foundVenues = false;
      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} venues with selector: ${selector}`);
          // Show first element content
          console.log(`First element HTML: ${$(elements[0]).html()?.substring(0, 200)}...`);
          foundVenues = true;
          break;
        }
      }
      
      if (!foundVenues) {
        console.log('❌ No venue cards found with any selector');
        console.log('Available elements:');
        $('*[class*="vendor"], *[class*="listing"], *[class*="card"]').each((i, el) => {
          if (i < 5) {
            console.log(`  ${$(el).prop('tagName')}.${$(el).attr('class')}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing correct WeddingWire URL:', error);
  } finally {
    await browser.close();
  }
}

testCorrectWeddingWireUrl()
  .then(() => {
    console.log('✅ Correct WeddingWire URL test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Correct WeddingWire URL test failed:', error);
    process.exit(1);
  });
