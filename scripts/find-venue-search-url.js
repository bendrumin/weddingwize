// Find the correct venue search URL by analyzing the individual venue page
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function findVenueSearchUrl() {
  console.log('🔍 Finding the correct venue search URL...');
  
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
    
    // Start with the individual venue page
    const venueUrl = 'https://www.weddingwire.com/biz/lakota-oaks-norwalk/7a7d44f5dd921db2.html';
    console.log(`🎯 Analyzing individual venue page: ${venueUrl}`);
    
    await page.goto(venueUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const content = await page.content();
    const $ = cheerio.load(content);
    
    console.log(`Title: ${$('title').text()}`);
    
    // Look for navigation links or breadcrumbs that might lead to venue search
    console.log('\n🔍 Looking for venue search links...');
    
    // Check for navigation links
    $('a[href*="venue"], a[href*="wedding-venue"]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text) {
        console.log(`Found venue link: "${text}" -> ${href}`);
      }
    });
    
    // Check for breadcrumbs
    $('.breadcrumb, .breadcrumbs, [class*="breadcrumb"]').each((i, el) => {
      const breadcrumb = $(el).text().trim();
      if (breadcrumb) {
        console.log(`Breadcrumb: ${breadcrumb}`);
      }
    });
    
    // Look for category links
    $('a[href*="category"], a[href*="type"]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text && text.toLowerCase().includes('venue')) {
        console.log(`Found category link: "${text}" -> ${href}`);
      }
    });
    
    // Now try to find the correct search URL by testing different patterns
    console.log('\n🎯 Testing different search URL patterns...');
    
    const searchUrls = [
      'https://www.weddingwire.com/wedding-venues/',
      'https://www.weddingwire.com/c/ct-connecticut/norwalk/wedding-venues/',
      'https://www.weddingwire.com/c/ct-connecticut/norwalk/wedding-venues/10-vendors.html',
      'https://www.weddingwire.com/wedding-venues/connecticut/norwalk',
      'https://www.weddingwire.com/wedding-venues/norwalk-ct',
      'https://www.weddingwire.com/wedding-venues/ct/norwalk'
    ];
    
    for (const url of searchUrls) {
      console.log(`\nTesting: ${url}`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const content = await page.content();
        const $ = cheerio.load(content);
        const title = $('title').text();
        
        console.log(`Title: ${title}`);
        
        if (title.toLowerCase().includes('venue') && !title.toLowerCase().includes('photographer')) {
          console.log('✅ This looks like a venue search page!');
          
          // Check for venue cards
          const venueSelectors = [
            '.vendor-card', '.listing-card', '.business-card', '.venue-card',
            '[data-testid="vendor-card"]', '.search-result', '.result-item'
          ];
          
          for (const selector of venueSelectors) {
            const elements = $(selector);
            if (elements.length > 0) {
              console.log(`✅ Found ${elements.length} venue cards with selector: ${selector}`);
              break;
            }
          }
        } else {
          console.log('❌ Not a venue search page');
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in venue search URL finder:', error);
  } finally {
    await browser.close();
  }
}

findVenueSearchUrl()
  .then(() => {
    console.log('\n✅ Venue search URL finder completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Venue search URL finder failed:', error);
    process.exit(1);
  });
