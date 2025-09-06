// Test script to scrape a specific venue page
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testSpecificVenue() {
  console.log('🧪 Testing specific venue page scraping...');
  
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
    
    // Test the specific venue page you mentioned
    const url = 'https://www.weddingwire.com/biz/lakota-oaks-norwalk/7a7d44f5dd921db2.html';
    console.log(`Testing URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const content = await page.content();
    const $ = cheerio.load(content);
    
    console.log(`Page loaded, content length: ${content.length}`);
    console.log(`Title: ${$('title').text()}`);
    
    // Try to extract venue information
    const venueData = {
      name: $('h1').text().trim() || $('.business-name').text().trim(),
      description: $('.business-description').text().trim() || $('p').first().text().trim(),
      rating: parseFloat($('.rating').text()) || 0,
      reviewCount: parseInt($('.review-count').text().replace(/[^\d]/g, '')) || 0,
      location: $('.location').text().trim() || $('.address').text().trim(),
      website: $('a[href*="http"]').first().attr('href'),
      price: $('.price').text().trim() || $('.pricing').text().trim()
    };
    
    console.log('📊 Extracted venue data:');
    console.log(JSON.stringify(venueData, null, 2));
    
    // Check if we got any real data
    if (venueData.name && venueData.name.length > 0) {
      console.log('✅ Successfully extracted real venue data!');
    } else {
      console.log('⚠️  No real data extracted, page might be blocked or structure changed');
    }
    
  } catch (error) {
    console.error('❌ Error testing specific venue:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testSpecificVenue()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
