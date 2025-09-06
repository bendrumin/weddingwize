// Direct test of VendorScraper
import dotenv from 'dotenv';
import { VendorScraper } from '../src/lib/scraping/vendorScraper';

dotenv.config({ path: '.env.local' });

async function testDirectScraper() {
  console.log('🧪 Testing VendorScraper directly...');
  
  try {
    console.log('1. Creating VendorScraper...');
    const scraper = new VendorScraper();
    console.log('✅ VendorScraper created');
    
    console.log('2. Initializing scraper...');
    await scraper.initialize();
    console.log('✅ VendorScraper initialized');
    
    console.log('3. Starting scrape...');
    const venues = await scraper.scrapeVenues('Austin, TX', 1);
    console.log(`✅ Scraping completed. Found ${venues.length} venues`);
    
    if (venues.length > 0) {
      console.log('🎉 SUCCESS! Found venues:');
      venues.forEach((venue, index) => {
        console.log(`  ${index + 1}. ${venue.name} (${venue.location.city}, ${venue.location.state})`);
      });
    } else {
      console.log('❌ No venues found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  }
}

testDirectScraper();
