// Simple scraper test without TypeScript
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

dotenv.config({ path: '.env.local' });

async function testSimpleScraper() {
  console.log('🧪 Testing simple scraper logic...');
  
  let browser;
  try {
    console.log('1. Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    console.log('✅ Browser launched');

    // Enhanced anti-detection setup
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: () => Promise.resolve({ state: 'granted' })
        })
      });
    });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('2. Navigating to wedding venues page...');
    const url = 'https://www.theknot.com/marketplace/wedding-reception-venues/minnesota';
    console.log(`🌐 Going to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ Page loaded');

    // Wait and scroll
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('3. Extracting content...');
    const content = await page.content();
    const $ = cheerio.load(content);
    
    console.log(`📄 Page title: ${$('title').text()}`);
    console.log(`📄 Total elements: ${$('*').length}`);

    // Test selectors - updated for actual venue listings
    const selectors = [
      // Venue-specific selectors
      '[data-testid*="vendor"]',
      '[data-testid*="venue"]',
      '[data-testid*="listing"]',
      '[data-testid*="card"]',
      '.vendor-card',
      '.venue-card',
      '.listing-card',
      '.business-card',
      // Generic selectors
      '[class*="vendor"]',
      '[class*="venue"]',
      '[class*="listing"]',
      '[class*="card"]',
      'article[class*="card"]',
      '.card',
      // The Knot specific
      '.tk-header-pagelet__featured-card-link',
      // Generic containers
      'article',
      '.listing',
      '.business'
    ];

    console.log('4. Testing selectors...');
    let foundElements = 0;
    let venuesFound = 0;
    
    for (const selector of selectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`✅ ${selector}: ${count} elements`);
        foundElements += count;
        
        // Try to extract venue data from first few elements
        console.log(`🔍 Testing venue extraction from ${selector}...`);
        $(selector).slice(0, 5).each((index, element) => {
          const $el = $(element);
          
          // Try multiple ways to get a name - enhanced for venue listings
          const name = $el.find('h1, h2, h3, h4, .name, .title, .business-name, .venue-name, a').first().text().trim() || 
                      $el.find('[class*="name"], [class*="title"]').first().text().trim() ||
                      $el.text().split('\n')[0].trim() ||
                      $el.attr('title') ||
                      $el.attr('alt') ||
                      $el.attr('data-name') ||
                      'Unknown';
          
          const text = $el.text().substring(0, 150).replace(/\s+/g, ' ').trim();
          const classes = $el.attr('class') || 'no-class';
          const href = $el.find('a').first().attr('href') || 'no-link';
          
          console.log(`  📋 Element ${index + 1}:`);
          console.log(`     Name: "${name}"`);
          console.log(`     Classes: "${classes}"`);
          console.log(`     Link: "${href}"`);
          console.log(`     Text: "${text}..."`);
          
          // Count as venue if it has a reasonable name
          if (name && name.length > 2 && name !== 'Unknown') {
            venuesFound++;
            console.log(`     🏢 ^ This looks like a venue!`);
          }
        });
      } else {
        console.log(`❌ ${selector}: 0 elements`);
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total elements found: ${foundElements}`);
    console.log(`   Potential venues found: ${venuesFound}`);
    
    if (foundElements > 0) {
      console.log('\n🎉 SUCCESS: Found elements that could contain venue data!');
      if (venuesFound > 0) {
        console.log(`🏢 Found ${venuesFound} potential venues - the scraper CAN work!`);
        console.log('🔧 The issue is likely in the API scraper configuration or parsing logic');
      } else {
        console.log('⚠️ Found elements but no clear venue names - may need better selectors');
      }
    } else {
      console.log('\n❌ ISSUE: No elements found with any selector');
      console.log('🔧 The website structure may have changed or we need different selectors');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testSimpleScraper();
