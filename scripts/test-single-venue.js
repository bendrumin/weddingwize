// Test scraping a single venue page
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testSingleVenue() {
  console.log('🔍 Testing single venue scraping...');
  
  try {
    const response = await fetch('http://localhost:3000/api/scrape-vendors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: 'san-francisco-ca',
        category: 'venue',
        maxPages: 1
      })
    });

    const result = await response.json();
    console.log('📊 Single Venue Test Results:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.vendorsFound > 0) {
      console.log('\n✅ Successfully scraped venue(s)!');
      console.log(`Found ${result.vendorsFound} vendors, stored ${result.vendorsStored}`);
    } else {
      console.log('\n❌ No venues found');
      console.log('This suggests the scraper is not finding the individual venue pages');
    }
    
  } catch (error) {
    console.error('❌ Error testing single venue:', error);
  }
}

testSingleVenue()
  .then(() => {
    console.log('✅ Single venue test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Single venue test failed:', error);
    process.exit(1);
  });
