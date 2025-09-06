// Test the new simplified scraper
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

async function testNewSimpleScraper() {
  console.log('🧪 Testing new simplified scraper...');
  
  try {
    console.log('📞 Calling API...');
    const response = await fetch('http://localhost:3001/api/scraping/venues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      },
      body: JSON.stringify({
        action: 'scrape_location',
        location: 'Minnesota'
      })
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    const result = await response.json();
    console.log('\n📊 API Response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.venuesFound > 0) {
      console.log('\n🎉 SUCCESS: Found real venue data!');
      console.log(`🏢 Total venues: ${result.venuesFound}`);
    } else {
      console.log('\n❌ Still no venues found');
      if (result.suggestions) {
        console.log('💡 Suggestions:');
        result.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNewSimpleScraper();
