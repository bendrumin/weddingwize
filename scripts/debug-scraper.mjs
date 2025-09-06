// Debug scraper with real-time logging
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function debugScraper() {
  console.log('🔍 DEBUGGING SCRAPER - Watching for detailed logs...');
  console.log('📊 Make sure to check your Next.js server console for detailed output');
  console.log('⏳ Triggering scraper in 3 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    console.log('🚀 Triggering API scraper...');
    const response = await fetch('http://localhost:3000/api/scraping/venues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      },
      body: JSON.stringify({
        action: 'scrape_location',
        location: 'Austin, TX'
      })
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    const result = await response.json();
    console.log('\n📊 API Response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.venuesFound === 0) {
      console.log('\n❌ DEBUGGING NEEDED:');
      console.log('1. Check your Next.js server console (where you ran "npm run dev")');
      console.log('2. Look for detailed selector testing logs');
      console.log('3. Check if any elements are being found');
      console.log('4. Verify venue parsing is working');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugScraper();
