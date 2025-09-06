import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// List of locations to scrape
const LOCATIONS_TO_SCRAPE = [
  'Minnesota',
  'California', 
  'Texas',
  'Florida',
  'New York',
  'Illinois',
  'Pennsylvania',
  'Ohio',
  'Georgia',
  'North Carolina'
];

async function runScheduledScraping() {
  console.log('🕐 Starting scheduled venue scraping...');
  console.log(`📅 Time: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const location of LOCATIONS_TO_SCRAPE) {
    try {
      console.log(`\n🌍 Scraping venues for ${location}...`);
      
      // Call the scraping API
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scraping/venues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        },
        body: JSON.stringify({ location })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${location}: Found ${data.venuesFound} venues`);
        results.push({
          location,
          venuesFound: data.venuesFound,
          success: true
        });
      } else {
        console.error(`❌ ${location}: Failed to scrape - ${response.status}`);
        results.push({
          location,
          venuesFound: 0,
          success: false,
          error: `HTTP ${response.status}`
        });
      }
      
      // Wait between locations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error(`❌ ${location}: Error - ${error.message}`);
      results.push({
        location,
        venuesFound: 0,
        success: false,
        error: error.message
      });
    }
  }
  
  // Log summary
  const totalVenues = results.reduce((sum, r) => sum + r.venuesFound, 0);
  const successful = results.filter(r => r.success).length;
  
  console.log('\n📊 Scraping Summary:');
  console.log(`   Total venues found: ${totalVenues}`);
  console.log(`   Successful locations: ${successful}/${LOCATIONS_TO_SCRAPE.length}`);
  console.log(`   Failed locations: ${LOCATIONS_TO_SCRAPE.length - successful}`);
  
  // Log failed locations
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed locations:');
    failed.forEach(f => console.log(`   - ${f.location}: ${f.error}`));
  }
  
  // Update last scraping timestamp in database
  try {
    const { error } = await supabase
      .from('scraping_logs')
      .insert({
        timestamp: new Date().toISOString(),
        total_venues: totalVenues,
        successful_locations: successful,
        failed_locations: failed.length,
        locations_scraped: LOCATIONS_TO_SCRAPE.length,
        results: results
      });
    
    if (error) {
      console.error('❌ Failed to log scraping results:', error);
    } else {
      console.log('✅ Scraping results logged to database');
    }
  } catch (logError) {
    console.error('❌ Error logging results:', logError);
  }
  
  console.log('\n🏁 Scheduled scraping completed!');
  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runScheduledScraping()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { runScheduledScraping };
