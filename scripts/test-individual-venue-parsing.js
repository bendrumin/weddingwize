// Test individual venue parsing
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testIndividualVenueParsing() {
  console.log('🔍 Testing individual venue parsing...');
  
  try {
    // Test with a specific venue URL
    const response = await fetch('http://localhost:3000/api/scrape-vendors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: 'norwalk-ct', // Use the location from the venue we know works
        category: 'venue',
        maxPages: 1
      })
    });

    const result = await response.json();
    console.log('📊 Individual Venue Parsing Results:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.vendorsFound > 0) {
      console.log('\n✅ Successfully parsed individual venue!');
    } else {
      console.log('\n❌ Failed to parse individual venue');
    }
    
  } catch (error) {
    console.error('❌ Error testing individual venue parsing:', error);
  }
}

testIndividualVenueParsing()
  .then(() => {
    console.log('✅ Individual venue parsing test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Individual venue parsing test failed:', error);
    process.exit(1);
  });
