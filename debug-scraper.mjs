import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function debugScraper() {
  console.log('🔍 Debugging scraper initialization...');
  
  try {
    // Test the API endpoint directly
    const response = await fetch('http://localhost:3000/api/scraping/venues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret-key-123'
      },
      body: JSON.stringify({ location: 'Minnesota' })
    });
    
    const data = await response.json();
    console.log('📊 API Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugScraper();
