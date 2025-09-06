// Script to populate initial vendor data for testing
const fetch = require('node-fetch');

const metroAreas = [
  'san-francisco-ca',
  'new-york-ny', 
  'los-angeles-ca',
  'chicago-il',
  'seattle-wa',
  'austin-tx',
  'denver-co',
  'miami-fl'
];

const categories = ['venue', 'photography'];

async function populateData() {
  console.log('🚀 Starting initial data population...');
  
  let totalVendors = 0;
  
  for (const location of metroAreas) {
    console.log(`\n📍 Populating ${location}...`);
    
    for (const category of categories) {
      try {
        console.log(`  📸 Scraping ${category} vendors...`);
        
        const response = await fetch('http://localhost:3000/api/scrape-vendors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location,
            category,
            maxPages: 1
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`  ✅ Found ${result.vendorsFound} ${category} vendors in ${location}`);
          totalVendors += result.vendorsFound;
        } else {
          console.log(`  ❌ Failed to scrape ${category} in ${location}:`, result.error);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`  ❌ Error scraping ${category} in ${location}:`, error.message);
      }
    }
    
    // Delay between metro areas
    console.log(`  ⏳ Waiting before next metro area...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n🎉 Data population completed!`);
  console.log(`📊 Total vendors added: ${totalVendors}`);
  console.log(`🏙️  Metro areas: ${metroAreas.length}`);
  console.log(`📂 Categories: ${categories.length}`);
}

// Run the population
populateData()
  .then(() => {
    console.log('✅ Initial data population script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Population failed:', error);
    process.exit(1);
  });
