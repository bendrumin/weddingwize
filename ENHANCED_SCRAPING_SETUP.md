# 🚀 Enhanced Venue Scraping System

This guide covers the enhanced scraping system that extracts detailed information from individual venue pages on The Knot.

## 🎯 What's New

### **Enhanced Data Extraction:**
- ✅ **Detailed Descriptions**: Full venue descriptions from individual pages
- ✅ **Amenities**: Comprehensive list of venue amenities and features
- ✅ **Pricing Details**: Detailed pricing information and packages
- ✅ **Capacity Details**: Specific capacity information and room details
- ✅ **Contact Information**: Phone numbers, emails, and websites
- ✅ **Portfolio Images**: High-quality venue images from galleries
- ✅ **Customer Reviews**: Real customer testimonials and reviews

### **Smart Scraping Features:**
- 🔄 **Two-Phase Scraping**: Basic listing data + detailed page data
- ⚡ **Performance Optimized**: Limits detailed scraping to first 5 venues
- 🛡️ **Rate Limiting**: 3-second delays between detailed page visits
- 🎛️ **Configurable**: Enable/disable detailed scraping via environment variable
- 📊 **Comprehensive Logging**: Detailed extraction statistics

## 🗄️ Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- 1. Add enhanced venue fields (if not already done)
-- Run: add-venue-fields.sql

-- 2. Add detailed venue fields
-- Run: add-detailed-venue-fields.sql

-- 3. Add vendor inquiries table
-- Run: add-vendor-inquiries.sql

-- 4. Add scraping logs table
-- Run: add-scraping-logs.sql
```

## ⚙️ Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# Enable detailed scraping (optional)
SCRAPE_DETAILED_INFO=true

# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=test-secret-key-123
```

### Scraping Modes

**Basic Mode** (Default):
- Scrapes listing pages only
- Fast and efficient
- Good for bulk data collection

**Enhanced Mode** (`SCRAPE_DETAILED_INFO=true`):
- Scrapes listing pages + individual venue pages
- Slower but much richer data
- Perfect for detailed venue profiles

## 🧪 Testing

### Test Basic Scraping
```bash
# Test basic venue scraping
npm run scrape
```

### Test Detailed Scraping
```bash
# Test detailed scraping for a specific venue
node test-detailed-scraping.mjs
```

### Test Individual Venue
```bash
# Test scraping a specific venue URL
curl -X POST http://localhost:3000/api/scraping/venues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-secret-key-123" \
  -d '{"location":"Minnesota"}'
```

## 📊 Data Structure

### Basic Venue Data (from listing pages):
```json
{
  "name": "The Grand 1858 at Minneapolis Event Centers",
  "location": { "city": "Minneapolis", "state": "MN", "full": "Minneapolis, MN" },
  "rating": 4.9,
  "reviewCount": 130,
  "pricing": { "min": 1000, "max": 3000, "currency": "USD", "description": "$$ – Affordable" },
  "capacity": { "min": 125, "max": 250, "description": "Up to 250 Guests" },
  "description": "Event Venue in Minneapolis, MN. Capacity: Up to 250 Guests, Pricing: $$ – Affordable, 4.9 stars (130 reviews)."
}
```

### Enhanced Venue Data (with detailed scraping):
```json
{
  // ... basic data above ...
  "detailedDescription": "The Grand 1858 at Minneapolis Event Centers is a stunning historic venue...",
  "amenities": ["Bridal Suite", "Catering Kitchen", "Parking", "AV Equipment", "Outdoor Ceremony Space"],
  "pricingDetails": "Starting at $2,500 for weekday events, $3,500 for weekends. Includes tables, chairs, linens, and basic AV.",
  "capacityDetails": "Main ballroom accommodates up to 250 guests. Outdoor ceremony space for 300. Multiple smaller rooms available.",
  "contact": {
    "phone": "(612) 555-0123",
    "email": "info@grand1858.com",
    "website": "https://grand1858.com"
  },
  "portfolioImages": ["https://...", "https://...", "https://..."],
  "reviews": [
    {
      "text": "Absolutely beautiful venue! The staff was amazing and everything went perfectly.",
      "author": "Sarah M."
    }
  ]
}
```

## 🎨 UI Enhancements

### Vendor Profile Pages
- **Rich Descriptions**: Detailed venue descriptions
- **Amenities Display**: Comprehensive amenities list
- **Enhanced Contact**: Phone, email, and website links
- **Portfolio Gallery**: High-quality venue images
- **Customer Reviews**: Real testimonials and reviews
- **Detailed Information**: Pricing and capacity details

### Vendor Cards
- **Capacity Information**: Guest count display
- **Enhanced Data**: All scraped fields visible
- **Direct Links**: Click to view detailed profiles

## 🚀 Usage Examples

### Enable Detailed Scraping
```bash
# Set environment variable
export SCRAPE_DETAILED_INFO=true

# Run scraper
npm run scrape
```

### Automated Scraping with Details
```bash
# Set up cron job with detailed scraping
SCRAPE_DETAILED_INFO=true npm run setup-cron
```

### Manual Testing
```bash
# Test specific venue URL
node -e "
import { VendorScraper } from './src/lib/scraping/vendorScraper.js';
const scraper = new VendorScraper();
await scraper.initialize();
const details = await scraper.scrapeVenueDetails('https://www.theknot.com/marketplace/the-grand-1858-at-minneapolis-event-centers-minneapolis-mn-961404');
console.log(JSON.stringify(details, null, 2));
await scraper.close();
"
```

## 📈 Performance Considerations

### Scraping Limits
- **Basic Mode**: ~16 venues per location in ~15 seconds
- **Enhanced Mode**: ~5 venues per location in ~2-3 minutes
- **Rate Limiting**: 3-second delays between detailed page visits

### Optimization Tips
1. **Use Basic Mode** for bulk data collection
2. **Use Enhanced Mode** for featured venues or detailed profiles
3. **Limit Enhanced Scraping** to first 5 venues per location
4. **Monitor Rate Limits** to avoid getting blocked

## 🔧 Troubleshooting

### Common Issues

1. **"No detailed information extracted"**
   - Check if `SCRAPE_DETAILED_INFO=true` is set
   - Verify venue URLs are valid The Knot links
   - Check browser console for errors

2. **"Rate limited or blocked"**
   - Increase delays between requests
   - Use fewer venues for detailed scraping
   - Check if IP is blocked

3. **"Database field not found"**
   - Run the SQL scripts to add new fields
   - Check field names match between scraper and database

### Debug Mode
```bash
# Enable detailed logging
DEBUG=true npm run scrape
```

## 🎯 Next Steps

1. **Run SQL Scripts**: Set up the database schema
2. **Test Basic Scraping**: Verify basic functionality
3. **Enable Detailed Scraping**: Test enhanced data extraction
4. **Set Up Automation**: Configure scheduled scraping
5. **Monitor Results**: Check vendor profiles for rich data

## 📊 Expected Results

With enhanced scraping enabled, you'll get:
- **Rich Descriptions**: 2-3x longer, more detailed descriptions
- **Comprehensive Amenities**: 10-20 amenities per venue
- **Detailed Contact Info**: Phone, email, and website for most venues
- **Portfolio Images**: 3-10 high-quality images per venue
- **Customer Reviews**: 2-5 real customer testimonials
- **Pricing Details**: Specific pricing information and packages

The enhanced scraping system transforms basic venue listings into comprehensive, detailed profiles that provide real value to your users! 🚀
