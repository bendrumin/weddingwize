// Test different WeddingWire venue URL patterns
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testVenueUrls() {
  console.log('🔍 Testing different WeddingWire venue URL patterns...');
  
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
    
    // Test different URL patterns
    const urls = [
      'https://www.weddingwire.com/c/ca-california/san-francisco/wedding-venues/10-vendors.html',
      'https://www.weddingwire.com/c/ca-california/san-francisco/wedding-venues/',
      'https://www.weddingwire.com/wedding-venues/san-francisco-ca',
      'https://www.weddingwire.com/wedding-venues/san-francisco-ca/',
      'https://www.weddingwire.com/wedding-venues/ca/san-francisco',
      'https://www.weddingwire.com/wedding-venues/california/san-francisco'
    ];
    
    for (const url of urls) {
      console.log(`\n🎯 Testing URL: ${url}`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const content = await page.content();
        const $ = cheerio.load(content);
        
        const title = $('title').text();
        console.log(`Title: ${title}`);
        
        // Check if it's actually showing venues
        if (title.toLowerCase().includes('venue')) {
          console.log('✅ This URL shows venues!');
          
          // Try to find venue cards
          const selectors = [
            '.vendor-card', '.listing-card', '.business-card', '.venue-card',
            '[data-testid="vendor-card"]', '.search-result', '.result-item',
            '.vendor-listing', '.listing-item', '.vendor', '.listing'
          ];
          
          for (const selector of selectors) {
            const elements = $(selector);
            if (elements.length > 0) {
              console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
              break;
            }
          }
        } else if (title.toLowerCase().includes('photographer')) {
          console.log('❌ This URL shows photographers, not venues');
        } else {
          console.log('⚠️  This URL shows something else');
        }
        
      } catch (error) {
        console.log(`❌ Error loading ${url}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in venue URL test:', error);
  } finally {
    await browser.close();
  }
}

testVenueUrls()
  .then(() => {
    console.log('\n✅ Venue URL test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Venue URL test failed:', error);
    process.exit(1);
  });
