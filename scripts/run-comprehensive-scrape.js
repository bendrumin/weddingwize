#!/usr/bin/env node

/**
 * Script to run comprehensive venue scraping in batches
 * This can be used to manually trigger scraping or run it locally
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'test-secret-key-123';

async function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function runComprehensiveScrape() {
  console.log('🚀 Starting comprehensive venue scraping...');
  
  let startIndex = 0;
  const maxStates = 10; // Process 10 states per batch
  let totalVenues = 0;
  let batchCount = 0;
  
  while (startIndex < 50) {
    batchCount++;
    console.log(`\n📊 Running batch ${batchCount} (states ${startIndex + 1}-${Math.min(startIndex + maxStates, 50)})...`);
    
    try {
      const response = await makeRequest(`${API_BASE_URL}/api/scraping/comprehensive`, {
        startIndex,
        maxStates
      });
      
      if (response.status === 200) {
        const result = response.data;
        console.log(`✅ Batch ${batchCount} completed successfully`);
        console.log(`   - Venues scraped: ${result.venuesScraped}`);
        console.log(`   - States processed: ${result.summary.statesProcessed}`);
        console.log(`   - Average venues per state: ${result.summary.venuesPerState}`);
        
        totalVenues += result.venuesScraped;
        
        if (result.batchInfo.isComplete) {
          console.log('\n🎉 All states completed!');
          break;
        }
        
        startIndex = result.batchInfo.nextStartIndex;
        
        // Wait between batches to avoid overwhelming the system
        console.log('⏳ Waiting 30 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
      } else {
        console.error(`❌ Batch ${batchCount} failed:`, response.data);
        break;
      }
      
    } catch (error) {
      console.error(`❌ Error in batch ${batchCount}:`, error.message);
      break;
    }
  }
  
  console.log(`\n📊 Comprehensive scraping completed!`);
  console.log(`   - Total batches: ${batchCount}`);
  console.log(`   - Total venues: ${totalVenues}`);
  console.log(`   - Average per batch: ${Math.round(totalVenues / batchCount)}`);
}

// Check status function
async function checkStatus() {
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/scraping/comprehensive`, {});
    console.log('📊 Current scraping status:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

// Main execution
const command = process.argv[2];

if (command === 'status') {
  checkStatus();
} else if (command === 'run') {
  runComprehensiveScrape();
} else {
  console.log('Usage:');
  console.log('  node scripts/run-comprehensive-scrape.js run    - Run comprehensive scraping');
  console.log('  node scripts/run-comprehensive-scrape.js status - Check current status');
  console.log('');
  console.log('Environment variables:');
  console.log('  API_BASE_URL - Base URL for the API (default: http://localhost:3000)');
  console.log('  CRON_SECRET  - Secret key for authentication (default: test-secret-key-123)');
}
