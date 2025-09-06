# 🤖 Automated Venue Scraping Setup

This guide will help you set up automated venue scraping to keep your venue data fresh and up-to-date.

## 📋 Prerequisites

1. **Database Setup**: Run the SQL commands to add the scraping logs table
2. **Environment Variables**: Ensure your `.env.local` has the required variables
3. **Server Running**: Your Next.js development server should be running

## 🗄️ Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- 1. Add enhanced venue fields (if not already done)
-- Run: add-venue-fields.sql

-- 2. Add scraping logs table
-- Run: add-scraping-logs.sql
```

## 🚀 Quick Setup

### Option 1: Manual Testing
```bash
# Test the scraper manually
npm run scrape
```

### Option 2: Automated Cron Job
```bash
# Set up automated scraping every 6 hours
npm run setup-cron
```

## ⚙️ Configuration

### Scraping Locations
Edit `scripts/scheduled-scraper.mjs` to modify which locations are scraped:

```javascript
const LOCATIONS_TO_SCRAPE = [
  'Minnesota',
  'California', 
  'Texas',
  'Florida',
  'New York',
  // Add more locations as needed
];
```

### Scraping Frequency
Edit `scripts/setup-cron.sh` to change the frequency:

```bash
# Every 6 hours (current)
"0 */6 * * * $CRON_COMMAND"

# Every 12 hours
"0 */12 * * * $CRON_COMMAND"

# Daily at 2 AM
"0 2 * * * $CRON_COMMAND"

# Weekly on Sundays at 3 AM
"0 3 * * 0 $CRON_COMMAND"
```

## 📊 Monitoring

### View Scraping Logs
```bash
# View recent scraping activity
tail -f logs/scraping.log
```

### Check Database Logs
Query the `scraping_logs` table in Supabase to see:
- When scraping last ran
- How many venues were found
- Which locations succeeded/failed
- Detailed results for each location

### Manual Scraping
```bash
# Run scraper for specific location
curl -X POST http://localhost:3000/api/scraping/venues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-secret-key-123" \
  -d '{"location":"Minnesota"}'
```

## 🔧 Troubleshooting

### Common Issues

1. **"Could not find the 'amenities' column"**
   - Run the `add-venue-fields.sql` script

2. **"numeric field overflow"**
   - Fixed: Ratings are now capped at 5.0

3. **"CRON_SECRET not found"**
   - Ensure `.env.local` has `CRON_SECRET=test-secret-key-123`

4. **Cron job not running**
   - Check: `crontab -l`
   - View logs: `tail -f logs/scraping.log`

### Performance Tips

- **Rate Limiting**: 5-second delay between locations prevents blocking
- **Batch Processing**: Scrapes 16 venues per location (first page only)
- **Error Handling**: Continues scraping even if one location fails
- **Logging**: All activities are logged for monitoring

## 📈 Results

The automated scraper will:
- ✅ Scrape 10+ major US states
- ✅ Extract 150+ venues per run
- ✅ Update venue data with ratings, pricing, capacity
- ✅ Log all activities for monitoring
- ✅ Handle errors gracefully
- ✅ Run automatically every 6 hours

## 🎯 Next Steps

1. **Run the SQL scripts** to set up the database
2. **Test manually** with `npm run scrape`
3. **Set up automation** with `npm run setup-cron`
4. **Monitor results** in the UI and logs
5. **Adjust frequency** based on your needs

Your venue data will now stay fresh and up-to-date automatically! 🚀
