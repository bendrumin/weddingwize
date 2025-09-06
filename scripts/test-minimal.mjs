// Minimal test to debug scraper
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

async function testMinimal() {
  console.log('🧪 Minimal scraper test...');
  
  const logFile = '/tmp/scraper-test.log';
  const timestamp = new Date().toISOString();
  
  try {
    // Log test start
    fs.appendFileSync(logFile, `[${timestamp}] Starting minimal test\n`);
    
    console.log('📞 Calling API...');
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
    
    const result = await response.json();
    console.log('📊 Result:', result);
    
    // Log result
    fs.appendFileSync(logFile, `[${timestamp}] API Response: ${JSON.stringify(result)}\n`);
    
    // Check if debug file was created
    try {
      const debugContent = fs.readFileSync('/tmp/scraper-debug.json', 'utf8');
      console.log('📄 Debug file found!');
      fs.appendFileSync(logFile, `[${timestamp}] Debug file content: ${debugContent}\n`);
    } catch (error) {
      console.log('❌ Debug file not found');
      fs.appendFileSync(logFile, `[${timestamp}] Debug file not found: ${error.message}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    fs.appendFileSync(logFile, `[${timestamp}] Error: ${error.message}\n`);
  }
  
  console.log(`📝 Check ${logFile} for detailed logs`);
}

testMinimal();
