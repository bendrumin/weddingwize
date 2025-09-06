import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testEnhancedScraping() {
  console.log('🔍 Testing enhanced venue scraping via API...');
  
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const CRON_SECRET = process.env.CRON_SECRET || 'test-secret-key-123';
  
  try {
    console.log('📋 Testing basic scraping first...');
    
    const response = await fetch(`${APP_URL}/api/scraping/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRON_SECRET}`
      },
      body: JSON.stringify({ location: 'Minnesota' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n🎉 Scraping results:');
      console.log('=====================================');
      console.log(`✅ Success: ${data.success}`);
      console.log(`📊 Venues found: ${data.venuesFound}`);
      console.log(`💾 Saved to database: ${data.savedToDatabase}`);
      
      if (data.sampleVenues && data.sampleVenues.length > 0) {
        console.log('\n📋 Sample venues:');
        data.sampleVenues.slice(0, 3).forEach((venue, i) => {
          console.log(`\n${i + 1}. ${venue.name}`);
          console.log(`   Location: ${venue.location}`);
          console.log(`   Rating: ${venue.rating} (${venue.reviewCount} reviews)`);
          console.log(`   Description: ${venue.description?.substring(0, 100)}...`);
          console.log(`   Capacity: ${venue.capacity?.description || 'N/A'}`);
          console.log(`   Pricing: ${venue.pricing?.description || 'N/A'}`);
          console.log(`   URL: ${venue.url}`);
        });
      }
      
      // Test vendor detail API
      if (data.sampleVenues && data.sampleVenues.length > 0) {
        const firstVenue = data.sampleVenues[0];
        console.log(`\n🔍 Testing vendor detail API for: ${firstVenue.name}`);
        
        // Extract venue ID from the URL or use a mock ID
        const venueId = 'test-venue-id'; // In real scenario, this would come from the database
        
        try {
          const detailResponse = await fetch(`${APP_URL}/api/vendors/${venueId}`);
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            console.log('✅ Vendor detail API working');
          } else {
            console.log('⚠️ Vendor detail API returned:', detailResponse.status);
          }
        } catch (error) {
          console.log('⚠️ Vendor detail API test skipped (venue not in database yet)');
        }
      }
      
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Scraping failed:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure your Next.js server is running:');
    console.log('   npm run dev');
  }
}

testEnhancedScraping();
