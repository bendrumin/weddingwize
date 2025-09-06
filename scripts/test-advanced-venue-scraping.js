// Advanced venue scraping test to extract more data from the actual venue page
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function testAdvancedVenueScraping() {
  console.log('🔍 Testing advanced venue scraping...');
  
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
    
    const url = 'https://www.weddingwire.com/biz/lakota-oaks-norwalk/7a7d44f5dd921db2.html';
    console.log(`Testing URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const content = await page.content();
    const $ = cheerio.load(content);
    
    console.log(`Page loaded, content length: ${content.length}`);
    console.log(`Title: ${$('title').text()}`);
    
    // Extract comprehensive venue data
    const venueData = {
      // Basic info
      name: extractText($, [
        'h1',
        '.business-name',
        '.vendor-name',
        '[data-testid="business-name"]',
        '.listing-title'
      ]),
      
      // Description - try multiple approaches
      description: extractText($, [
        '.business-description',
        '.vendor-description',
        '.about-section p',
        '.description',
        '.summary',
        'meta[name="description"]'
      ]) || extractText($, ['p']).substring(0, 200),
      
      // Rating and reviews
      rating: extractRating($, [
        '.rating',
        '.stars',
        '.review-rating',
        '[class*="rating"]',
        '.score'
      ]),
      
      reviewCount: extractReviewCount($, [
        '.review-count',
        '.reviews',
        '.review-total',
        '[class*="review"]',
        '.total-reviews'
      ]),
      
      // Location
      location: extractText($, [
        '.location',
        '.address',
        '.city',
        '.business-location',
        '[class*="location"]'
      ]) || extractFromTitle($),
      
      // Contact info
      website: extractHref($, [
        'a[href*="http"]:not([href*="weddingwire"])',
        '.website-link',
        '.business-link',
        '.contact-website'
      ]),
      
      phone: extractText($, [
        '.phone',
        '.telephone',
        '[href^="tel:"]',
        '.contact-phone'
      ]),
      
      email: extractText($, [
        '.email',
        '[href^="mailto:"]',
        '.contact-email'
      ]),
      
      // Pricing
      price: extractText($, [
        '.price',
        '.pricing',
        '.cost',
        '.rate',
        '[class*="price"]'
      ]),
      
      // Images
      images: extractImages($),
      
      // Additional details
      specialties: extractSpecialties($),
      
      // Raw HTML for debugging
      rawTitle: $('title').text(),
      rawHeadings: $('h1, h2, h3').map((i, el) => $(el).text().trim()).get().slice(0, 5),
      rawParagraphs: $('p').map((i, el) => $(el).text().trim()).get().slice(0, 3)
    };
    
    console.log('\n📊 Advanced extracted venue data:');
    console.log(JSON.stringify(venueData, null, 2));
    
    // Check if we got meaningful data
    const hasGoodData = venueData.name && venueData.name.length > 0 && 
                       venueData.description && venueData.description.length > 10;
    
    if (hasGoodData) {
      console.log('\n✅ Successfully extracted comprehensive venue data!');
    } else {
      console.log('\n⚠️  Limited data extracted, may need better selectors');
    }
    
  } catch (error) {
    console.error('❌ Error in advanced venue scraping:', error);
  } finally {
    await browser.close();
  }
}

// Helper functions
function extractText($, selectors) {
  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    if (text && text.length > 0) {
      return text;
    }
  }
  return '';
}

function extractRating($, selectors) {
  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    const rating = parseFloat(text);
    if (!isNaN(rating) && rating > 0) {
      return rating;
    }
  }
  return 0;
}

function extractReviewCount($, selectors) {
  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    const count = parseInt(text.replace(/[^\d]/g, ''));
    if (!isNaN(count) && count > 0) {
      return count;
    }
  }
  return 0;
}

function extractHref($, selectors) {
  for (const selector of selectors) {
    const href = $(selector).first().attr('href');
    if (href && href.startsWith('http')) {
      return href;
    }
  }
  return '';
}

function extractImages($) {
  const images = [];
  $('img').each((i, img) => {
    const src = $(img).attr('src');
    if (src && !src.includes('placeholder') && !src.includes('logo') && !src.includes('icon')) {
      images.push(src);
    }
  });
  return images.slice(0, 5);
}

function extractSpecialties($) {
  const specialties = [];
  $('.specialty, .service, .feature, .amenity').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 0) {
      specialties.push(text);
    }
  });
  return specialties.slice(0, 5);
}

function extractFromTitle($) {
  const title = $('title').text();
  // Extract location from title like "Whispering Oaks - Hotel Weddings - Norwalk, CT"
  const match = title.match(/- ([^-]+)$/);
  return match ? match[1].trim() : '';
}

testAdvancedVenueScraping()
  .then(() => {
    console.log('\n✅ Advanced venue scraping test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Advanced venue scraping test failed:', error);
    process.exit(1);
  });
