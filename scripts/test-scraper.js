// Simple test script to run the scraper via API
const fetch = require('node-fetch');

const METRO_AREAS = [
  'san-francisco-ca',
  'new-york-ny',
  'los-angeles-ca',
  'chicago-il',
  'houston-tx'
];

const CATEGORIES = ['venue', 'photography'];

async function runScraping() {
  console.log('🚀 Starting vendor scraping...');
  
  for (const metroArea of METRO_AREAS.slice(0, 2)) { // Test with first 2 areas
    console.log(`\n📍 Scraping ${metroArea}...`);
    
    for (const category of CATEGORIES) {
      console.log(`  📸 Scraping ${category} vendors...`);
      
      try {
        const response = await fetch('http://localhost:3000/api/scrape-vendors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: metroArea,
            category: category,
            maxPages: 2 // Small test
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          console.log(`  ✅ Found ${result.vendorsFound} ${category} vendors in ${metroArea}`);
        } else {
          console.log(`  ❌ Error: ${result.error}`);
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`  ❌ Error scraping ${category} in ${metroArea}:`, error.message);
      }
    }
    
    // Add delay between metro areas
    console.log(`  ⏳ Waiting before next metro area...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log(`\n🎉 Scraping test completed!`);
}

// Run the scraping
runScraping()
  .then(() => {
    console.log('✅ Test scraping script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
