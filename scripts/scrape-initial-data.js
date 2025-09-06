// Note: This script needs to be run with ts-node or compiled first
// For now, let's use the API endpoint approach instead

// Major US metro areas for initial scraping
const METRO_AREAS = [
  'new-york-ny',
  'los-angeles-ca', 
  'chicago-il',
  'houston-tx',
  'phoenix-az',
  'philadelphia-pa',
  'san-antonio-tx',
  'san-diego-ca',
  'dallas-tx',
  'san-jose-ca',
  'austin-tx',
  'jacksonville-fl',
  'fort-worth-tx',
  'columbus-oh',
  'charlotte-nc',
  'san-francisco-ca',
  'indianapolis-in',
  'seattle-wa',
  'denver-co',
  'washington-dc'
];

const CATEGORIES = ['venue', 'photography'];

async function runInitialScraping() {
  console.log('🚀 Starting initial vendor data scraping...');
  
  const scraper = new VendorScraper({
    respectRateLimit: true,
    maxConcurrency: 2,
    retryFailedRequests: 2
  });

  try {
    await scraper.initialize();
    console.log('✅ Scraper initialized');

    let totalVendors = 0;

    for (const metroArea of METRO_AREAS) {
      console.log(`\n📍 Scraping ${metroArea}...`);
      
      for (const category of CATEGORIES) {
        console.log(`  📸 Scraping ${category} vendors...`);
        
        try {
          let vendors = [];
          
          if (category === 'venue') {
            vendors = await scraper.scrapeVenues(metroArea, 3); // 3 pages per category
          } else if (category === 'photography') {
            vendors = await scraper.scrapePhotographers(metroArea, 3);
          }
          
          console.log(`  ✅ Found ${vendors.length} ${category} vendors in ${metroArea}`);
          totalVendors += vendors.length;
          
          // Add delay between categories
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (error) {
          console.error(`  ❌ Error scraping ${category} in ${metroArea}:`, error.message);
        }
      }
      
      // Add delay between metro areas
      console.log(`  ⏳ Waiting before next metro area...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log(`\n🎉 Scraping completed! Total vendors found: ${totalVendors}`);
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
  } finally {
    await scraper.close();
    console.log('🔒 Scraper closed');
  }
}

// Run the scraping
if (require.main === module) {
  runInitialScraping()
    .then(() => {
      console.log('✅ Initial scraping script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { runInitialScraping };
