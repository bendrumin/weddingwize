// lib/scrapers/venue-scraper.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { setTimeout } from 'timers/promises';

// Types matching your Supabase schema
interface ScrapedVenue {
  name: string;
  category: 'venue';
  location: {
    city: string;
    state: string;
    zipcode?: string;
    coordinates?: { lat: number; lng: number };
    address?: string;
  };
  pricing: {
    min?: number;
    max?: number;
    currency: 'USD';
    per_unit: 'event' | 'person' | 'hour';
    notes?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    social?: Record<string, string>;
  };
  portfolio_images: string[];
  description?: string;
  specialties: string[];
  rating?: number;
  review_count?: number;
  capacity?: {
    min_guests?: number;
    max_guests?: number;
  };
  amenities?: string[];
  venue_type?: string[];
}


class VenueScraper {
  private browser: Browser | null = null;
  private supabase: SupabaseClient;
  private userAgents: string[];
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    ];
  }

  async initBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async setupPage(): Promise<Page> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    
    // Anti-detection measures
    await page.setUserAgent(this.getRandomUserAgent());
    await page.setViewport({ width: 1366, height: 768 });
    
    // Block unnecessary resources for speed
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  // The Knot scraper
  private async scrapeTheKnot(page: Page, location: string): Promise<ScrapedVenue[]> {
    const venues: ScrapedVenue[] = [];
    
    try {
      const searchUrl = `https://www.theknot.com/marketplace/wedding-venues/${location.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`Scraping The Knot: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await setTimeout(2000); // Wait for dynamic content
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      $('.vendor-card, .storefrontCardWrapper').each((i, element) => {
        try {
          const $el = $(element);
          
          const name = $el.find('.vendor-name, .storefrontCard-title').text().trim();
          if (!name) return;
          
          const description = $el.find('.vendor-description, .storefrontCard-description').text().trim();
          const priceText = $el.find('.price-range, .storefrontCard-price').text().trim();
          const ratingText = $el.find('.rating, .review-stars').text().trim();
          const reviewCountText = $el.find('.review-count').text().trim();
          
          // Extract images
          const images: string[] = [];
          $el.find('img').each((_, img) => {
            const src = $(img).attr('src') || $(img).attr('data-src');
            if (src && src.includes('http')) {
              images.push(src);
            }
          });
          
          // Parse pricing
          const pricing = this.parsePricing(priceText);
          
          // Extract specialties/amenities
          const specialties: string[] = [];
          $el.find('.amenity, .tag, .specialty').each((_, tag) => {
            const specialty = $(tag).text().trim();
            if (specialty) specialties.push(specialty);
          });
          
          const venue: ScrapedVenue = {
            name,
            category: 'venue',
            location: {
              city: location.split(',')[0].trim(),
              state: location.split(',')[1]?.trim() || '',
            },
            pricing,
            contact: {
              website: $el.find('a').attr('href') || undefined,
            },
            portfolio_images: images.slice(0, 10), // Limit images
            description,
            specialties,
            rating: this.parseRating(ratingText),
            review_count: this.parseReviewCount(reviewCountText),
          };
          
          venues.push(venue);
        } catch (error) {
          console.error('Error parsing venue from The Knot:', error);
        }
      });
      
    } catch (error) {
      console.error('Error scraping The Knot:', error);
    }
    
    return venues;
  }

  // WeddingWire scraper
  private async scrapeWeddingWire(page: Page, location: string): Promise<ScrapedVenue[]> {
    const venues: ScrapedVenue[] = [];
    
    try {
      const searchUrl = `https://www.weddingwire.com/wedding-venues/${location.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`Scraping WeddingWire: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await setTimeout(2000);
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      $('.vendor-card-info, .search-item').each((i, element) => {
        try {
          const $el = $(element);
          
          const name = $el.find('.vendor-name, .vendor-title h3').text().trim();
          if (!name) return;
          
          const description = $el.find('.vendor-description, .vendor-summary').text().trim();
          const priceText = $el.find('.price-range, .price').text().trim();
          const location_text = $el.find('.vendor-location, .location').text().trim();
          
          // Extract contact info
          const phone = $el.find('.phone, [href^="tel:"]').text().trim();
          const website = $el.find('.website, .vendor-website').attr('href');
          
          // Extract images
          const images: string[] = [];
          $el.find('img').each((_, img) => {
            const src = $(img).attr('src') || $(img).attr('data-src');
            if (src && src.includes('http')) {
              images.push(src);
            }
          });
          
          // Extract venue types/specialties
          const specialties: string[] = [];
          $el.find('.venue-type, .category, .specialty-tag').each((_, tag) => {
            const specialty = $(tag).text().trim();
            if (specialty) specialties.push(specialty);
          });
          
          const venue: ScrapedVenue = {
            name,
            category: 'venue',
            location: this.parseLocation(location_text || location),
            pricing: this.parsePricing(priceText),
            contact: {
              phone: phone || undefined,
              website: website || undefined,
            },
            portfolio_images: images.slice(0, 10),
            description,
            specialties,
          };
          
          venues.push(venue);
        } catch (error) {
          console.error('Error parsing venue from WeddingWire:', error);
        }
      });
      
    } catch (error) {
      console.error('Error scraping WeddingWire:', error);
    }
    
    return venues;
  }

  // Zola scraper
  private async scrapeZola(page: Page, location: string): Promise<ScrapedVenue[]> {
    const venues: ScrapedVenue[] = [];
    
    try {
      const searchUrl = `https://www.zola.com/wedding-venues/${location.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`Scraping Zola: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await setTimeout(2000);
      
      // Zola often loads content dynamically, so we might need to scroll
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await setTimeout(1000);
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      $('.vendor-card, .venue-listing').each((i, element) => {
        try {
          const $el = $(element);
          
          const name = $el.find('.vendor-name, .venue-name h3').text().trim();
          if (!name) return;
          
          const description = $el.find('.description, .venue-description').text().trim();
          const priceText = $el.find('.price, .pricing').text().trim();
          
          // Extract images
          const images: string[] = [];
          $el.find('img').each((_, img) => {
            const src = $(img).attr('src') || $(img).attr('data-src');
            if (src && src.includes('http')) {
              images.push(src);
            }
          });
          
          const venue: ScrapedVenue = {
            name,
            category: 'venue',
            location: {
              city: location.split(',')[0].trim(),
              state: location.split(',')[1]?.trim() || '',
            },
            pricing: this.parsePricing(priceText),
            contact: {},
            portfolio_images: images.slice(0, 10),
            description,
            specialties: [],
          };
          
          venues.push(venue);
        } catch (error) {
          console.error('Error parsing venue from Zola:', error);
        }
      });
      
    } catch (error) {
      console.error('Error scraping Zola:', error);
    }
    
    return venues;
  }

  // Utility functions
  private parsePricing(priceText: string): ScrapedVenue['pricing'] {
    const pricing: ScrapedVenue['pricing'] = {
      currency: 'USD',
      per_unit: 'event',
    };
    
    if (!priceText) return pricing;
    
    // Extract numbers from price text
    const numbers = priceText.match(/\$?[\d,]+/g);
    if (numbers && numbers.length > 0) {
      const cleanNumbers = numbers.map(n => parseInt(n.replace(/[$,]/g, '')));
      
      if (cleanNumbers.length === 1) {
        pricing.min = cleanNumbers[0];
      } else if (cleanNumbers.length >= 2) {
        pricing.min = Math.min(...cleanNumbers);
        pricing.max = Math.max(...cleanNumbers);
      }
    }
    
    // Determine per_unit based on text context
    if (priceText.toLowerCase().includes('person') || priceText.toLowerCase().includes('guest')) {
      pricing.per_unit = 'person';
    } else if (priceText.toLowerCase().includes('hour')) {
      pricing.per_unit = 'hour';
    }
    
    pricing.notes = priceText;
    return pricing;
  }

  private parseLocation(locationText: string): ScrapedVenue['location'] {
    const parts = locationText.split(',').map(p => p.trim());
    return {
      city: parts[0] || '',
      state: parts[1] || '',
      address: locationText,
    };
  }

  private parseRating(ratingText: string): number | undefined {
    const match = ratingText.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private parseReviewCount(reviewText: string): number | undefined {
    const match = reviewText.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  // Main scraping orchestrator
  async scrapeVenuesForLocation(location: string): Promise<void> {
    console.log(`Starting venue scraping for location: ${location}`);
    
    // Log scraping job start
    const { data: job } = await this.supabase
      .from('scraping_jobs')
      .insert({
        job_type: 'venues',
        target_location: { city: location.split(',')[0], state: location.split(',')[1] },
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    let totalVenuesFound = 0;
    let totalVenuesUpdated = 0;
    const errors: string[] = [];

    try {
      await this.initBrowser();
      
      const scrapers = [
        { name: 'TheKnot', scraper: this.scrapeTheKnot.bind(this) },
        { name: 'WeddingWire', scraper: this.scrapeWeddingWire.bind(this) },
        { name: 'Zola', scraper: this.scrapeZola.bind(this) },
      ];

      for (const { name, scraper } of scrapers) {
        try {
          console.log(`Starting ${name} scraper...`);
          const page = await this.setupPage();
          
          const venues = await scraper(page, location);
          console.log(`${name}: Found ${venues.length} venues`);
          
          // Save venues to database
          for (const venue of venues) {
            try {
              await this.saveVenue(venue);
              totalVenuesUpdated++;
            } catch (error) {
              console.error(`Error saving venue ${venue.name}:`, error);
              errors.push(`Failed to save ${venue.name}: ${error}`);
            }
          }
          
          totalVenuesFound += venues.length;
          await page.close();
          
          // Rate limiting - wait between scrapers
          await setTimeout(5000);
          
        } catch (error) {
          console.error(`Error in ${name} scraper:`, error);
          errors.push(`${name} scraper failed: ${error}`);
        }
      }

    } catch (error) {
      console.error('Fatal error in venue scraping:', error);
      errors.push(`Fatal error: ${error}`);
    } finally {
      await this.closeBrowser();
      
      // Update scraping job status
      if (job) {
        await this.supabase
          .from('scraping_jobs')
          .update({
            status: errors.length > 0 ? 'completed_with_errors' : 'completed',
            vendors_found: totalVenuesFound,
            vendors_updated: totalVenuesUpdated,
            errors_encountered: errors,
            completed_at: new Date().toISOString(),
            next_run_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
          })
          .eq('id', job.id);
      }
      
      console.log(`Scraping completed. Found: ${totalVenuesFound}, Saved: ${totalVenuesUpdated}, Errors: ${errors.length}`);
    }
  }

  private async saveVenue(venue: ScrapedVenue): Promise<void> {
    // Check if venue already exists (by name + location)
    const { data: existingVenue } = await this.supabase
      .from('vendors')
      .select('id, last_scraped')
      .eq('name', venue.name)
      .eq('category', 'venue')
      .contains('location', { city: venue.location.city })
      .single();

    if (existingVenue) {
      // Update existing venue
      await this.supabase
        .from('vendors')
        .update({
          ...venue,
          last_scraped: new Date().toISOString(),
        })
        .eq('id', existingVenue.id);
    } else {
      // Insert new venue
      await this.supabase
        .from('vendors')
        .insert({
          ...venue,
          last_scraped: new Date().toISOString(),
        });
    }
  }

  // Public method to run scraping for multiple locations
  async scrapeTopMetroAreas(): Promise<void> {
    const topMetroAreas = [
      'New York, NY',
      'Los Angeles, CA',
      'Chicago, IL',
      'Houston, TX',
      'Phoenix, AZ',
      'Philadelphia, PA',
      'San Antonio, TX',
      'San Diego, CA',
      'Dallas, TX',
      'San Jose, CA',
      'Austin, TX',
      'Jacksonville, FL',
      'Fort Worth, TX',
      'Columbus, OH',
      'Charlotte, NC',
      'San Francisco, CA',
      'Indianapolis, IN',
      'Seattle, WA',
      'Denver, CO',
      'Boston, MA',
    ];

    for (const location of topMetroAreas) {
      try {
        await this.scrapeVenuesForLocation(location);
        // Wait between locations to be respectful
        await setTimeout(10000);
      } catch (error) {
        console.error(`Failed to scrape ${location}:`, error);
      }
    }
  }
}

// Export for use in your Next.js API routes or cron jobs
export { VenueScraper, type ScrapedVenue };

// Usage example:
/*
const scraper = new VenueScraper(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Scrape a specific location
await scraper.scrapeVenuesForLocation('Austin, TX');

// Or scrape all top metro areas
await scraper.scrapeTopMetroAreas();
*/
