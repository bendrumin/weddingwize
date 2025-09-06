// Test if VendorScraper can be imported
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testImport() {
  try {
    console.log('🧪 Testing VendorScraper import...');
    
    // Try to import the VendorScraper
    const { VendorScraper } = await import('../src/lib/scraping/vendorScraper.js');
    console.log('✅ VendorScraper imported successfully');
    
    // Try to create an instance
    const scraper = new VendorScraper();
    console.log('✅ VendorScraper instance created');
    
    // Try to initialize
    await scraper.initialize();
    console.log('✅ VendorScraper initialized');
    
    // Try to close
    await scraper.close();
    console.log('✅ VendorScraper closed');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  }
}

testImport();
