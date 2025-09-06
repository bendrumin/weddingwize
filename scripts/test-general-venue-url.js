// Test the general venue URL to see if it works
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testGeneralVenueUrl() {
  console.log('🔍 Testing general venue URL...');
  
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
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Test the general venue URL
    const url = 'https://www.weddingwire.com/wedding-venues/';
    console.log(`Testing URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const content = await page.content();
    const $ = cheerio.load(content);
    
    console.log(`Title: ${$('title').text()}`);
    console.log(`Content length: ${content.length}`);
    
    // Look for venue cards
    const selectors = [
      '.vendor-card', '.listing-card', '.business-card', '.venue-card',
      '[data-testid="vendor-card"]', '.search-result', '.result-item',
      '.vendor-listing', '.listing-item', '.vendor', '.listing',
      '.card', '.item', '.result'
    ];
    
    let foundVenues = false;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
        // Show first element content
        console.log(`First element HTML: ${$(elements[0]).html()?.substring(0, 300)}...`);
        foundVenues = true;
        break;
      }
    }
    
    if (!foundVenues) {
      console.log('❌ No venue cards found');
      console.log('Available elements with "vendor" or "venue" in class:');
      $('*[class*="vendor"], *[class*="venue"], *[class*="listing"], *[class*="card"]').each((i, el) => {
        if (i < 10) {
          const className = $(el).attr('class');
          const tagName = $(el).prop('tagName');
          console.log(`  ${tagName}.${className}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing general venue URL:', error);
  } finally {
    await browser.close();
  }
}

testGeneralVenueUrl()
  .then(() => {
    console.log('✅ General venue URL test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ General venue URL test failed:', error);
    process.exit(1);
  });
