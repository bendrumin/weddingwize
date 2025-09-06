// Detailed test script to see what the real scraper is doing
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testDetailedScraping() {
  console.log('🔍 Testing detailed scraping with debugging...');
  
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
    console.log('📊 Detailed Scraper Results:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.vendorsFound === 0) {
      console.log('\n🔍 Analysis:');
      console.log('✅ Scraper is running without fallback data');
      console.log('❌ Real scraping is not finding any vendors');
      console.log('💡 This suggests:');
      console.log('   - Websites are blocking the scraper');
      console.log('   - Selectors need to be updated');
      console.log('   - Rate limiting is preventing access');
      console.log('   - Website structure has changed');
    }
    
  } catch (error) {
    console.error('❌ Error testing detailed scraping:', error);
  }
}

testDetailedScraping()
  .then(() => {
    console.log('✅ Detailed test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Detailed test failed:', error);
    process.exit(1);
  });
