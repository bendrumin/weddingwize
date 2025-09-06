// Test script to debug the real scraper
const fetch = require('node-fetch');

async function testRealScraper() {
  console.log('🧪 Testing real scraper with debugging...');
  
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
    
    console.log('📊 Scraper Results:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.vendorsFound > 0) {
      console.log('✅ Real scraping is working!');
    } else {
      console.log('⚠️  No vendors found, likely using fallback data');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRealScraper()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
