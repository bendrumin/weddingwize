// Test script to verify database connection and add sample data
const fetch = require('node-fetch');

async function testDatabase() {
  console.log('🧪 Testing database connection...');
  
  try {
    // Test adding a sample vendor directly
    const sampleVendor = {
      name: 'Test Venue',
      category: 'venue',
      business_type: 'venue',
      location: {
        city: 'San Francisco',
        state: 'CA',
        zipcode: '94102'
      },
      pricing: {
        min: 5000,
        max: 10000,
        currency: 'USD',
        per_unit: 'event'
      },
      contact: {
        website: 'https://testvenue.com'
      },
      portfolio_images: [],
      description: 'A beautiful test venue',
      specialties: ['elegant', 'downtown'],
      rating: 4.5,
      review_count: 50,
      reviews_summary: {
        positive: 45,
        negative: 5,
        commonThemes: ['beautiful', 'professional']
      },
      last_scraped: new Date().toISOString(),
      verified: false,
      featured: false
    };

    const response = await fetch('http://localhost:3000/api/scrape-vendors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: 'san-francisco-ca',
        category: 'venue',
        maxPages: 0, // Don't actually scrape, just test the endpoint
        testMode: true,
        sampleData: [sampleVendor]
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Database test successful!');
      console.log('Result:', result);
    } else {
      console.log('❌ Database test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDatabase()
  .then(() => {
    console.log('✅ Database test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
