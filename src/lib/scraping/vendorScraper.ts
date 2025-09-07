// lib/scraping/vendorScraper.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { VenueProfileData, VenueReview } from '../../types/index';

interface Venue {
  name: string;
  location: {
    city: string;
    state: string;
    full: string;
  };
  rating: number;
  reviewCount: number;
  url: string;
  imageUrl: string;
  source: string;
  pricing?: {
    min: number;
    max: number;
    currency: string;
    description?: string;
  };
  description?: string;
  capacity?: {
    min: number;
    max: number;
    description: string;
  };
  venueType?: string;
  amenities?: string[];
  specialties?: string[];
  contact?: {
    website?: string;
    phone?: string;
    email?: string;
  };
  portfolioImages?: string[];
  pricingDetails?: string;
  capacityDetails?: string;
  reviews?: Array<{
    text: string;
    author: string;
  }>;
  debug?: {
    cardText: string;
    hasRating: boolean;
    hasLocation: boolean;
    hasCapacity: boolean;
    hasPricing: boolean;
  };
}

interface VenueDetails {
  detailedDescription?: string;
  amenities?: string[];
  pricingDetails?: string;
  capacityDetails?: string;
  contact?: {
    website?: string;
    phone?: string;
    email?: string;
  };
  portfolioImages?: string[];
  reviews?: Array<{
    text: string;
    author: string;
  }>;
}

export class VendorScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    console.log('🚀 Initializing stealth Puppeteer browser...');
    
    // Check if we're in Vercel environment
    const isVercel = process.env.VERCEL === '1';
    console.log(`🌐 Environment: ${isVercel ? 'Vercel' : 'Local'}`);
    
    try {
      // Enhanced stealth configuration
      const launchOptions = isVercel ? {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--window-size=1920x1080',
          '--single-process',
          '--no-zygote',
          // Stealth enhancements
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-first-run',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-back-forward-cache',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-component-extensions-with-background-pages',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-first-run',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-back-forward-cache',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-component-extensions-with-background-pages'
        ]
      } : {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
          // Stealth enhancements
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-first-run',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-back-forward-cache',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-component-extensions-with-background-pages'
        ]
      };

      this.browser = await puppeteer.launch(launchOptions);
      console.log('✅ Stealth browser launched successfully');
    } catch (error: unknown) {
      console.error('❌ Failed to launch browser:', error);
      // Instead of throwing, set browser to null and handle gracefully
      this.browser = null;
      console.log('⚠️ Browser launch failed, scraper will use fallback methods');
      return;
    }
    
    if (this.browser) {
      try {
        this.page = await this.browser.newPage();
        console.log('✅ New page created');
        
        // Enhanced stealth user agents (rotate randomly)
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
        ];
        
        const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        await this.page.setUserAgent(randomUserAgent);
        console.log('✅ Random user agent set:', randomUserAgent);
        
        // Set realistic viewport
        await this.page.setViewport({ 
          width: 1920 + Math.floor(Math.random() * 100), 
          height: 1080 + Math.floor(Math.random() * 100) 
        });
        console.log('✅ Random viewport set');
        
        // Set extra headers to look more like a real browser
        await this.page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        });
        console.log('✅ Extra headers set');
        
        // Remove webdriver property
        await this.page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
          });
        });
        
        // Mock plugins
        await this.page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
          });
        });
        
        // Mock languages
        await this.page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
          });
        });
        
        console.log('✅ Stealth properties configured');
        console.log('✅ Stealth Puppeteer browser initialized');
      } catch (error: unknown) {
        console.error('❌ Failed to create page or set properties:', error);
        this.browser = null;
        this.page = null;
        console.log('⚠️ Page creation failed, scraper will use fallback methods');
      }
    }
  }

  async scrapeVenueDetails(venueUrl: string): Promise<VenueDetails | null> {
    try {
      console.log(`🔍 Scraping detailed info from: ${venueUrl}`);
      
      // Add random delay before navigation
      const preDelay = Math.random() * 2000 + 1000; // 1-3 seconds
      console.log(`⏳ Pre-navigation delay: ${Math.round(preDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, preDelay));
      
      await this.page!.goto(venueUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Simulate human-like behavior
      await this.page!.mouse.move(100, 100);
      await new Promise(resolve => setTimeout(resolve, 300));
      await this.page!.mouse.move(200, 200);
      
      // Wait for page to load with random delay
      const postDelay = Math.random() * 2000 + 1000; // 1-3 seconds
      console.log(`⏳ Post-navigation delay: ${Math.round(postDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, postDelay));
      
      const detailedInfo = await this.page!.evaluate(() => {
        const result: {
          detailedDescription?: string;
          pricingDetails?: string;
          capacityDetails?: string;
        } = {};
        
        // Extract detailed description
        const descriptionSelectors = [
          '[data-testid="vendor-description"]',
          '.vendor-description',
          '.description',
          '.about-section',
          '.venue-description',
          'p[class*="description"]',
          '.vendor-about'
        ];
        
        for (const selector of descriptionSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            result.detailedDescription = element.textContent.trim();
            break;
          }
        }
        
        // Extract amenities
        const amenities: string[] = [];
        const amenitySelectors = [
          '[data-testid="amenities"]',
          '.amenities',
          '.features',
          '.venue-features',
          '.facilities',
          '[class*="amenity"]',
          '[class*="feature"]'
        ];
        
        for (const selector of amenitySelectors) {
          const container = document.querySelector(selector);
          if (container) {
            const items = container.querySelectorAll('li, .amenity-item, .feature-item, span');
            items.forEach(item => {
              const text = item.textContent?.trim();
              if (text && text.length > 2 && text.length < 100) {
                amenities.push(text);
              }
            });
            if (amenities.length > 0) break;
          }
        }
        
        // Extract pricing details
        const pricingSelectors = [
          '[data-testid="pricing"]',
          '.pricing',
          '.rates',
          '.cost',
          '.venue-pricing',
          '[class*="pricing"]'
        ];
        
        for (const selector of pricingSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            result.pricingDetails = element.textContent.trim();
            break;
          }
        }
        
        // Extract capacity details
        const capacitySelectors = [
          '[data-testid="capacity"]',
          '.capacity',
          '.guest-count',
          '.venue-capacity',
          '[class*="capacity"]'
        ];
        
        for (const selector of capacitySelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            result.capacityDetails = element.textContent.trim();
            break;
          }
        }
        
        // Extract contact information
        const contactInfo: {
          phone?: string;
          email?: string;
          website?: string;
        } = {};
        
        // Phone number
        const phoneRegex = /\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/;
        const phoneMatch = document.body.textContent?.match(phoneRegex);
        if (phoneMatch) {
          contactInfo.phone = phoneMatch[0];
        }
        
        // Email
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const emailMatch = document.body.textContent?.match(emailRegex);
        if (emailMatch) {
          contactInfo.email = emailMatch[0];
        }
        
        // Website
        const websiteLink = document.querySelector('a[href*="http"]:not([href*="theknot.com"])');
        if (websiteLink) {
          contactInfo.website = (websiteLink as HTMLAnchorElement).href;
        }
        
        // Extract portfolio images
        const images: string[] = [];
        const imageSelectors = [
          '[data-testid="gallery"] img',
          '.gallery img',
          '.portfolio img',
          '.venue-images img',
          '.photos img',
          '[class*="gallery"] img',
          '[class*="portfolio"] img'
        ];
        
        for (const selector of imageSelectors) {
          const imgs = document.querySelectorAll(selector);
          imgs.forEach(img => {
            const src = (img as HTMLImageElement).src;
            if (src && !src.includes('placeholder') && !src.includes('loading')) {
              images.push(src);
            }
          });
          if (images.length > 0) break;
        }
        
        // Extract reviews/testimonials
        const reviews: Array<{
          text: string;
          author: string;
        }> = [];
        const reviewSelectors = [
          '[data-testid="reviews"] .review',
          '.reviews .review',
          '.testimonials .testimonial',
          '.customer-reviews .review',
          '[class*="review"]'
        ];
        
        for (const selector of reviewSelectors) {
          const reviewElements = document.querySelectorAll(selector);
          reviewElements.forEach(review => {
            const text = review.textContent?.trim();
            if (text && text.length > 20) {
              reviews.push({
                text: text.substring(0, 500),
                author: 'Customer'
              });
            }
          });
          if (reviews.length > 0) break;
        }
        
        return {
          detailedDescription: result.detailedDescription,
          amenities: amenities.slice(0, 20), // Limit to 20 amenities
          pricingDetails: result.pricingDetails,
          capacityDetails: result.capacityDetails,
          contact: contactInfo,
          portfolioImages: images.slice(0, 10), // Limit to 10 images
          reviews: reviews.slice(0, 5) // Limit to 5 reviews
        };
      });
      
      console.log(`✅ Extracted detailed info:`, {
        hasDescription: !!detailedInfo.detailedDescription,
        amenitiesCount: detailedInfo.amenities?.length || 0,
        hasPricing: !!detailedInfo.pricingDetails,
        hasCapacity: !!detailedInfo.capacityDetails,
        hasContact: Object.keys(detailedInfo.contact || {}).length > 0,
        imagesCount: detailedInfo.portfolioImages?.length || 0,
        reviewsCount: detailedInfo.reviews?.length || 0
      });
      
      return detailedInfo;
      
    } catch (error) {
      console.error(`❌ Error scraping venue details from ${venueUrl}:`, error);
      return null;
    }
  }

  async scrapeVenueProfile(venueUrl: string): Promise<VenueProfileData | null> {
    if (!this.page) {
      console.log('⚠️ Puppeteer not available for profile scraping');
      return null;
    }

    try {
      console.log(`🔍 Scraping comprehensive profile from: ${venueUrl}`);
      await this.page.goto(venueUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));

      const profileData = await this.page.evaluate(() => {
        // Helper function to extract text safely
        const getText = (selector: string): string => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() || '';
        };

        // Helper function to check if element exists
        const exists = (selector: string): boolean => {
          return document.querySelector(selector) !== null;
        };

        // Helper function to extract multiple elements
        const getTexts = (selector: string): string[] => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent?.trim() || '');
        };

        // Extract basic information
        const basic = {
          name: getText('h1') || getText('[data-testid="vendor-name"]') || getText('.vendor-name'),
          tagline: getText('.tagline, .subtitle, .vendor-tagline, .venue-tagline'),
          description: getText('.description, .vendor-description, .venue-description, .about-text, p'),
          address: getText('.address, .venue-address, [data-testid="address"], .location-address'),
          neighborhood: getText('.neighborhood, .district, .area'),
          businessType: getText('.business-type, .venue-type, .category'),
          languages: getTexts('.language, .languages span, .language-item')
        };

        // Extract capacity information
        const capacityText = getText('.capacity, .guest-capacity, [data-testid="capacity"], .guest-range');
        const capacityMatch = capacityText.match(/(\d+)\s*to\s*(\d+)/);
        const maxCapacityMatch = capacityText.match(/up to (\d+)/i) || capacityText.match(/(\d+)\+/);
        
        const capacity = {
          guestRange: capacityText,
          maxCapacity: maxCapacityMatch ? parseInt(maxCapacityMatch[1]) : (capacityMatch ? parseInt(capacityMatch[2]) : 0),
          capacityDescription: capacityText
        };

        // Extract amenities
        const amenityTexts = getTexts('.amenities li, .amenity-item, [data-testid="amenity"], .feature-item, .amenity');
        const amenities = {
          ceremonyArea: amenityTexts.some(text => text.toLowerCase().includes('ceremony area')),
          coveredOutdoorsSpace: amenityTexts.some(text => text.toLowerCase().includes('covered outdoors')),
          dressingRoom: amenityTexts.some(text => text.toLowerCase().includes('dressing room')),
          handicapAccessible: amenityTexts.some(text => text.toLowerCase().includes('handicap') || text.toLowerCase().includes('accessible')),
          indoorEventSpace: amenityTexts.some(text => text.toLowerCase().includes('indoor event')),
          liabilityInsurance: amenityTexts.some(text => text.toLowerCase().includes('liability insurance')),
          outdoorEventSpace: amenityTexts.some(text => text.toLowerCase().includes('outdoor event')),
          receptionArea: amenityTexts.some(text => text.toLowerCase().includes('reception area')),
          wirelessInternet: amenityTexts.some(text => text.toLowerCase().includes('wireless') || text.toLowerCase().includes('wifi'))
        };

        // Extract settings
        const settingTexts = getTexts('.settings li, .setting-item, [data-testid="setting"], .venue-setting, .style-item');
        const settings = {
          ballroom: settingTexts.some(text => text.toLowerCase().includes('ballroom')),
          garden: settingTexts.some(text => text.toLowerCase().includes('garden')),
          historicVenue: settingTexts.some(text => text.toLowerCase().includes('historic')),
          industrialWarehouse: settingTexts.some(text => text.toLowerCase().includes('industrial') || text.toLowerCase().includes('warehouse')),
          trees: settingTexts.some(text => text.toLowerCase().includes('trees'))
        };

        // Extract reviews
        const reviewElements = document.querySelectorAll('.review, .review-item, [data-testid="review"], .customer-review');
        const individualReviews: VenueReview[] = Array.from(reviewElements).map(review => {
          const author = review.querySelector('.author, .reviewer-name, .name, .reviewer')?.textContent?.trim() || '';
          const ratingText = review.querySelector('.rating, .stars, .star-rating')?.textContent?.trim() || '';
          const rating = parseFloat(ratingText.match(/\d+\.?\d*/)?.[0] || '0');
          const date = review.querySelector('.date, .review-date, .posted-date')?.textContent?.trim() || '';
          const content = review.querySelector('.content, .review-text, .review-content, p')?.textContent?.trim() || '';
          const highlighted = review.classList.contains('highlighted') || review.hasAttribute('data-highlighted');
          
          const responseElement = review.querySelector('.venue-response, .response, .owner-response');
          const venueResponse = responseElement ? {
            date: responseElement.querySelector('.date, .response-date')?.textContent?.trim() || '',
            content: responseElement.querySelector('.content, .response-text, .response-content')?.textContent?.trim() || ''
          } : undefined;

          return { author, rating, date, content, highlighted, venueResponse };
        });

        // Extract overall rating
        const ratingText = getText('.overall-rating, .rating-summary, [data-testid="rating"], .average-rating');
        const overallRating = parseFloat(ratingText.match(/\d+\.?\d*/)?.[0] || '0');
        const totalReviews = parseInt(ratingText.match(/\((\d+)\)/)?.[1] || '0');

        // Extract contact information
        const contact = {
          teamName: getText('.team-name, .coordinator-name, .contact-name'),
          role: getText('.role, .position, .title'),
          responseTime: getText('.response-time, .responds-within, .response-time-text'),
          contactForm: exists('form, .contact-form, [data-testid="contact-form"], .inquiry-form')
        };

        // Extract awards
        const awardText = getText('.awards, .award-winner, [data-testid="awards"], .recognition');
        const awards = {
          awardCount: parseInt(awardText.match(/(\d+)X/)?.[1] || '0'),
          awardType: awardText,
          awardSource: getText('.award-source, .award-description, .recognition-source')
        };

        // Extract pricing
        const pricingText = getText('.pricing, .price-details, [data-testid="pricing"], .cost-information');
        const pricing = {
          available: !pricingText.includes('No pricing details') && !pricingText.includes('Contact for pricing'),
          details: pricingText,
          requiresContact: pricingText.includes('No pricing details') || pricingText.includes('Contact for pricing')
        };

        // Extract images
        const imageElements = document.querySelectorAll('img');
        const media = {
          primaryImage: (imageElements[0] as HTMLImageElement)?.src || '',
          portfolioImages: Array.from(imageElements).slice(1).map(img => (img as HTMLImageElement).src).filter(src => 
            src && src.includes('http') && !src.includes('logo') && !src.includes('icon')
          ),
          reviewPhotos: Array.from(document.querySelectorAll('.review-photo img, .review-image img')).map(img => (img as HTMLImageElement).src)
        };

        // Extract service offerings
        const serviceOfferings = {
          barAndDrinks: {
            available: amenityTexts.some(text => text.toLowerCase().includes('bar') || text.toLowerCase().includes('drinks')),
            barRental: amenityTexts.some(text => text.toLowerCase().includes('bar rental'))
          },
          cakesAndDesserts: {
            available: amenityTexts.some(text => text.toLowerCase().includes('cake') || text.toLowerCase().includes('dessert')),
            cupcakes: amenityTexts.some(text => text.toLowerCase().includes('cupcake')),
            otherDesserts: amenityTexts.some(text => text.toLowerCase().includes('dessert'))
          },
          foodAndCatering: {
            available: amenityTexts.some(text => text.toLowerCase().includes('catering') || text.toLowerCase().includes('food'))
          },
          planning: {
            available: amenityTexts.some(text => text.toLowerCase().includes('planning')),
            seHablaEspanol: amenityTexts.some(text => text.toLowerCase().includes('español') || text.toLowerCase().includes('spanish')),
            weddingDesign: amenityTexts.some(text => text.toLowerCase().includes('design'))
          },
          rentalsAndEquipment: {
            available: amenityTexts.some(text => text.toLowerCase().includes('rental') || text.toLowerCase().includes('equipment')),
            tents: amenityTexts.some(text => text.toLowerCase().includes('tent'))
          },
          serviceStaff: {
            available: amenityTexts.some(text => text.toLowerCase().includes('staff') || text.toLowerCase().includes('service'))
          },
          transportation: {
            available: amenityTexts.some(text => text.toLowerCase().includes('transportation') || text.toLowerCase().includes('shuttle')),
            shuttleService: amenityTexts.some(text => text.toLowerCase().includes('shuttle'))
          }
        };

        // Extract services
        const services = {
          ceremoniesAndReceptions: amenityTexts.some(text => text.toLowerCase().includes('ceremony') && text.toLowerCase().includes('reception')),
          ceremonyTypes: amenityTexts.filter(text => 
            text.toLowerCase().includes('ceremony') || 
            text.toLowerCase().includes('civil union') || 
            text.toLowerCase().includes('elopement')
          )
        };

        // Extract team information
        const team = {
          teamName: getText('.team-name, .coordinator-name'),
          role: getText('.team-role, .coordinator-role'),
          description: getText('.team-description, .coordinator-description'),
          teamMessage: getText('.team-message, .coordinator-message, .welcome-message')
        };

        return {
          basic,
          capacity,
          amenities,
          settings,
          reviews: {
            overallRating,
            totalReviews,
            ratingBreakdown: {
              fiveStars: 0, // Would need to extract from rating distribution
              fourStars: 0,
              threeStars: 0,
              twoStars: 0,
              oneStar: 0
            },
            aiSummary: getText('.ai-summary, .review-summary, .summary'),
            sortOptions: getTexts('.sort-option, .review-sort option, .filter-option')
          },
          individualReviews,
          contact,
          awards,
          pricing,
          serviceOfferings,
          services,
          team,
          media,
          metadata: {
            sourceUrl: window.location.href,
            source: 'theknot',
            scrapedAt: new Date(),
            pageType: 'venue_profile'
          }
        } as VenueProfileData;
      });

      console.log('✅ Comprehensive profile extracted:', {
        hasBasicInfo: !!profileData.basic.name,
        hasCapacity: !!profileData.capacity.guestRange,
        amenityCount: Object.values(profileData.amenities).filter(Boolean).length,
        settingCount: Object.values(profileData.settings).filter(Boolean).length,
        reviewCount: profileData.individualReviews.length,
        hasContact: !!profileData.contact.teamName,
        hasAwards: profileData.awards.awardCount > 0,
        hasPricing: profileData.pricing.available,
        imageCount: profileData.media.portfolioImages.length
      });

      return profileData;
    } catch (error) {
      console.error(`❌ Error scraping venue profile from ${venueUrl}:`, error);
      return null;
    }
  }

  async scrapeAllVenues() {
    if (!this.page) {
      console.log('⚠️ Puppeteer not available, trying alternative scraping method');
      return this.scrapeAllVenuesWithFetch();
    }

    console.log(`🔍 Starting comprehensive scrape of venues from all 50 states...`);
    
    // Set timeout for Vercel (4 minutes to be safe)
    const timeout = process.env.VERCEL === '1' ? 240000 : 300000; // 4 min for Vercel, 5 min for local
    const startTime = Date.now();
    
    // All 50 US states with their URL-friendly names
    const allStates = [
      'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware',
      'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky',
      'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi',
      'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire', 'new-jersey', 'new-mexico',
      'new-york', 'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
      'rhode-island', 'south-carolina', 'south-dakota', 'tennessee', 'texas', 'utah', 'vermont',
      'virginia', 'washington', 'west-virginia', 'wisconsin', 'wyoming'
    ];
    
    const allVenues: Venue[] = [];
    let totalScraped = 0;
    const maxVenuesPerState = process.env.VERCEL === '1' ? 10 : 5; // Optimized for Vercel
    const maxStatesPerRun = process.env.VERCEL === '1' ? 5 : 2; // Process more states in Vercel
    
    // Get states to process (for batch processing)
    const startIndex = parseInt(process.env.STATE_START_INDEX || '0');
    const endIndex = Math.min(startIndex + maxStatesPerRun, allStates.length);
    const statesToProcess = allStates.slice(startIndex, endIndex);
    
    console.log(`🎯 Processing states ${startIndex + 1}-${endIndex} of ${allStates.length} (${statesToProcess.length} states)`);
    console.log(`🎯 Will scrape up to ${maxVenuesPerState} venues from each state`);
    
    for (let i = 0; i < statesToProcess.length; i++) {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        console.log(`⏰ Timeout reached (${timeout/1000}s), stopping scraping to avoid Vercel timeout`);
        break;
      }
      
      const state = statesToProcess[i];
      try {
        console.log(`🌐 [${i + 1}/${statesToProcess.length}] Scraping venues from ${state}...`);
        const baseUrl = `https://www.theknot.com/marketplace/wedding-reception-venues/${state}`;
        
        // Add random delay before navigation (optimized for Vercel)
        const preDelay = process.env.VERCEL === '1' ? Math.random() * 2000 + 1000 : Math.random() * 1000 + 500;
        console.log(`⏳ Pre-navigation delay: ${Math.round(preDelay)}ms`);
        await new Promise(resolve => setTimeout(resolve, preDelay));
        
        // Navigate to the state-specific page with stealth options
        await this.page.goto(baseUrl, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });

        // Simulate human-like behavior
        await this.page.mouse.move(100, 100);
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.page.mouse.move(200, 200);
        
        // Wait for page to load with random delay (optimized for Vercel)
        const postDelay = process.env.VERCEL === '1' ? Math.random() * 2000 + 1000 : Math.random() * 1000 + 500;
        console.log(`⏳ Post-navigation delay: ${Math.round(postDelay)}ms`);
        await new Promise(resolve => setTimeout(resolve, postDelay));
        console.log(`📋 Page loaded for ${state}, extracting venue data...`);

        // Extract venue data from this state
        const stateVenues = await this.page.evaluate(() => {
          // Use the same venue extraction logic as before
          const venueCards = document.querySelectorAll([
            '.info-container--37e68',
            '[class*="info-container"]',
            '[class*="vendor"]',
            '[data-testid="vendor-card"]',
            '.vendor-card',
            '.result-card',
            '.vendor-result',
            '.marketplace-vendor-card',
            '.vendor-result-card'
          ].join(', '));

          return Array.from(venueCards).map((card: Element) => {
            try {
              const cardText = card.textContent?.trim() || '';
              if (cardText.includes('Are you a vendor') || 
                  cardText.includes('Start here') || 
                  cardText.length < 20 ||
                  !cardText.match(/\d+\.?\d*\(\d+\)/)) {
                return null;
              }
              
              // Extract basic info (simplified for multi-state scraping)
              const nameMatch = cardText.match(/^([^0-9]+?)(\d+\.?\d*\(\d+\))/);
              const name = nameMatch ? nameMatch[1].trim() : 'Unknown Venue';
              
              // Extract rating
              const ratingMatch = cardText.match(/(\d+\.?\d*)\((\d+)\)/);
              let rating = 0;
              let reviewCount = 0;
              if (ratingMatch) {
                rating = parseFloat(ratingMatch[1]);
                reviewCount = parseInt(ratingMatch[2]);
                if (rating > 5.0) rating = 5.0;
              }
              
              // Extract location
              const locationMatch = cardText.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*, [A-Z]{2})/);
              const locationText = locationMatch ? locationMatch[1] : 'Unknown, Unknown';
              const [city, state] = locationText.split(', ').map(s => s.trim());
              
              // Extract URL - construct it from venue name since The Knot doesn't provide direct links
              const linkElement = card.querySelector('a[href*="/marketplace/"]');
              let url = '';
              
              if (linkElement) {
                const relativeUrl = linkElement.getAttribute('href') || '';
                url = relativeUrl.startsWith('http') ? relativeUrl : `https://www.theknot.com${relativeUrl}`;
              } else {
                // Construct URL from venue name and location
                const venueSlug = name
                  .toLowerCase()
                  .replace(/[^a-z0-9\s]/g, '') // Remove special characters
                  .replace(/\s+/g, '-') // Replace spaces with hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single
                  .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
                
                const locationSlug = locationText
                  .toLowerCase()
                  .replace(/[^a-z0-9\s,]/g, '') // Remove special characters except comma
                  .replace(/\s*,\s*/g, '-') // Replace comma and spaces with hyphen
                  .replace(/\s+/g, '-') // Replace remaining spaces with hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single
                  .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
                
                url = `https://www.theknot.com/marketplace/${venueSlug}-${locationSlug}`;
              }
              
              // Extract image
              const imageElement = card.querySelector('img');
              const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src') || '';
              
              // Extract capacity
              const capacityMatch = cardText.match(/(Up to \d+ Guests|\d+\+ Guests)/);
              const capacity = capacityMatch ? capacityMatch[1] : 'Unknown';
              
              // Extract pricing
              const pricingMatch = cardText.match(/(\$\$+[^$]*)/);
              const pricingText = pricingMatch ? pricingMatch[1] : 'Unknown';
              
              // Create a basic description from available info
              // The Knot cards don't contain full descriptions, so we'll create a meaningful one
              const capacityText = capacity !== 'Unknown' ? ` with ${capacity}` : '';
              const pricingDesc = pricingText !== 'Unknown' ? ` (${pricingText})` : '';
              const description = `${name} is a beautiful wedding venue in ${locationText}${capacityText}${pricingDesc}. Perfect for your special day with ${reviewCount} reviews and a ${rating}-star rating.`;
              
              return {
                name,
                location: {
                  city: city || '',
                  state: state || '',
                  full: locationText
                },
                rating,
                reviewCount,
                url,
                imageUrl,
                source: 'theknot',
                pricing: {
                  min: 1000,
                  max: 5000,
                  currency: 'USD',
                  description: pricingText
                },
                description,
                capacity: {
                  min: 0,
                  max: 0,
                  description: capacity
                },
                venueType: 'Event Venue',
                amenities: [],
                specialties: ['Wedding Reception', 'Ceremony', 'Corporate Events']
              };
            } catch {
              return null;
            }
          }).filter(venue => venue !== null && venue.name !== 'Unknown Venue');
        });
        
        // Try to get more venues by paginating through pages
        const currentVenues = stateVenues;
        let page = 2;
        const maxPagesPerState = 1; // Limit to 1 page per state for testing
        
        while (currentVenues.length < maxVenuesPerState && page <= maxPagesPerState) {
          try {
            console.log(`📄 Loading page ${page} for ${state}...`);
            
            // Try to find and click the next button
            const nextButtonClicked = await this.page.evaluate(() => {
              const selectors = [
                '[data-testid="pagination-next"]',
                '.pagination-next',
                '.next-page',
                'button[aria-label*="Next"]',
                'a[aria-label*="Next"]',
                'button[title*="Next"]',
                'a[title*="Next"]',
                'button[aria-label*="next"]',
                'a[aria-label*="next"]',
                'button[title*="next"]',
                'a[title*="next"]'
              ];
              
              for (const selector of selectors) {
                const element = document.querySelector(selector) as HTMLElement;
                if (element && element.offsetParent !== null) {
                  element.click();
                  return true;
                }
              }
              
              // Look for buttons/links containing "Next" text
              const buttons = document.querySelectorAll('button, a');
              for (const button of buttons) {
                const text = button.textContent?.toLowerCase().trim();
                if (text && (text.includes('next') || text.includes('→') || text.includes('>')) && (button as HTMLElement).offsetParent !== null) {
                  (button as HTMLElement).click();
                  return true;
                }
              }
              
              return false;
            });

            if (nextButtonClicked) {
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for page load
              console.log(`✅ Successfully navigated to page ${page} for ${state}`);
              
              // Extract venues from this page
              const pageVenues = await this.page.evaluate(() => {
                const venueCards = document.querySelectorAll([
                  '.info-container--37e68',
                  '[class*="info-container"]',
                  '[class*="vendor"]',
                  '[data-testid="vendor-card"]',
                  '.vendor-card',
                  '.result-card',
                  '.vendor-result',
                  '.marketplace-vendor-card',
                  '.vendor-result-card'
                ].join(', '));

                return Array.from(venueCards).map((card: Element) => {
                  try {
                    const cardText = card.textContent?.trim() || '';
                    if (cardText.includes('Are you a vendor') || 
                        cardText.includes('Start here') || 
                        cardText.length < 20 ||
                        !cardText.match(/\d+\.?\d*\(\d+\)/)) {
                      return null;
                    }
                    
                    const nameMatch = cardText.match(/^([^0-9]+?)(\d+\.?\d*\(\d+\))/);
                    const name = nameMatch ? nameMatch[1].trim() : 'Unknown Venue';
                    
                    const ratingMatch = cardText.match(/(\d+\.?\d*)\((\d+)\)/);
                    let rating = 0;
                    let reviewCount = 0;
                    if (ratingMatch) {
                      rating = parseFloat(ratingMatch[1]);
                      reviewCount = parseInt(ratingMatch[2]);
                      if (rating > 5.0) rating = 5.0;
                    }
                    
                    const locationMatch = cardText.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*, [A-Z]{2})/);
                    const locationText = locationMatch ? locationMatch[1] : 'Unknown, Unknown';
                    const [city, state] = locationText.split(', ').map(s => s.trim());
                    
                    // Extract URL - construct it from venue name since The Knot doesn't provide direct links
                    const linkElement = card.querySelector('a[href*="/marketplace/"]');
                    let url = '';
                    
                    if (linkElement) {
                      const relativeUrl = linkElement.getAttribute('href') || '';
                      url = relativeUrl.startsWith('http') ? relativeUrl : `https://www.theknot.com${relativeUrl}`;
                    } else {
                      // Construct URL from venue name and location
                      const venueSlug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                        .replace(/-+/g, '-') // Replace multiple hyphens with single
                        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
                      
                      const locationSlug = locationText
                        .toLowerCase()
                        .replace(/[^a-z0-9\s,]/g, '') // Remove special characters except comma
                        .replace(/\s*,\s*/g, '-') // Replace comma and spaces with hyphen
                        .replace(/\s+/g, '-') // Replace remaining spaces with hyphens
                        .replace(/-+/g, '-') // Replace multiple hyphens with single
                        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
                      
                      url = `https://www.theknot.com/marketplace/${venueSlug}-${locationSlug}`;
                    }
                    
                    const imageElement = card.querySelector('img');
                    const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src') || '';
                    
                    const capacityMatch = cardText.match(/(Up to \d+ Guests|\d+\+ Guests)/);
                    const capacity = capacityMatch ? capacityMatch[1] : 'Unknown';
                    
                    const pricingMatch = cardText.match(/(\$\$+[^$]*)/);
                    const pricingText = pricingMatch ? pricingMatch[1] : 'Unknown';
                    
                    // Create a basic description from available info
                    const capacityText = capacity !== 'Unknown' ? ` with ${capacity}` : '';
                    const pricingDesc = pricingText !== 'Unknown' ? ` (${pricingText})` : '';
                    const description = `${name} is a beautiful wedding venue in ${locationText}${capacityText}${pricingDesc}. Perfect for your special day with ${reviewCount} reviews and a ${rating}-star rating.`;
                    
                    return {
                      name,
                      location: {
                        city: city || '',
                        state: state || '',
                        full: locationText
                      },
                      rating,
                      reviewCount,
                      url,
                      imageUrl,
                      source: 'theknot',
                      pricing: {
                        min: 1000,
                        max: 5000,
                        currency: 'USD',
                        description: pricingText
                      },
                      description,
                      capacity: {
                        min: 0,
                        max: 0,
                        description: capacity
                      },
                      venueType: 'Event Venue',
                      amenities: [],
                      specialties: ['Wedding Reception', 'Ceremony', 'Corporate Events']
                    };
                  } catch {
                    return null;
                  }
                }).filter(venue => venue !== null && venue.name !== 'Unknown Venue');
              });
              
              currentVenues.push(...pageVenues);
              console.log(`✅ Added ${pageVenues.length} venues from page ${page} for ${state}`);
              page++;
              
            } else {
              console.log(`🚫 No more pages available for ${state}`);
              break;
            }
          } catch (error) {
            console.error(`❌ Error loading page ${page} for ${state}:`, error);
            break;
          }
        }
        
        // Limit venues per state
        const limitedVenues = currentVenues.slice(0, maxVenuesPerState);
        console.log(`✅ Found ${currentVenues.length} total venues in ${state}, keeping ${limitedVenues.length}`);
        
        allVenues.push(...limitedVenues.filter(venue => venue !== null));
        totalScraped += limitedVenues.length;
        
        // Progress update
        console.log(`📊 Progress: ${totalScraped} total venues collected so far`);
        
        // Add delay between states to avoid rate limiting (optimized for Vercel)
        const delay = process.env.VERCEL === '1' ? 2000 : 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.error(`❌ Error scraping ${state}:`, error);
        // Continue with next state
      }
    }
    
    console.log(`🎯 Comprehensive scrape completed! Total venues collected: ${allVenues.length}`);
    
    // Log summary by state
    const stateSummary = allVenues.reduce((acc, venue) => {
      const state = venue.location.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`📊 Venues by state:`, stateSummary);
    
    // Skip enhancement for now to avoid timeouts in admin route
    console.log(`⏭️ Skipping venue enhancement to avoid timeout - returning basic venue data`);
    console.log(`📊 Total venues returning: ${allVenues.length}`);
    
    return allVenues;
  }

  private formatLocationForUrl(location: string): string {
    // Convert "Minnesota" to "minnesota"
    // Convert "Minneapolis, MN" to "minneapolis-mn"
    return location
      .toLowerCase()
      .replace(/\s*,\s*/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  async scrapeAllVenuesWithFetch(): Promise<Venue[]> {
    console.log(`🌐 Using enhanced stealth fetch-based scraping...`);
    
    // Try multiple URLs to find venues
    const urlsToTry = [
      'https://www.theknot.com/marketplace/wedding-reception-venues',
      'https://www.theknot.com/marketplace/wedding-venues',
      'https://www.theknot.com/marketplace/venues'
    ];
    
    for (const baseUrl of urlsToTry) {
      try {
        console.log(`🌐 Trying URL: ${baseUrl}`);
        
        // Add random delay to avoid rate limiting
        const delay = Math.random() * 2000 + 1000; // 1-3 seconds
        console.log(`⏳ Waiting ${Math.round(delay)}ms before request...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Enhanced stealth headers with rotation
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
        ];
        
        const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'User-Agent': randomUserAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Connection': 'keep-alive',
            'DNT': '1',
            'Referer': 'https://www.google.com/',
            'Origin': 'https://www.google.com'
          },
          // Add timeout and retry logic
          signal: AbortSignal.timeout(30000)
        });
      
        if (!response.ok) {
          console.log(`❌ URL failed with status ${response.status}, trying next...`);
          continue;
        }
        
        const html = await response.text();
        console.log(`✅ Fetched ${html.length} characters of HTML from ${baseUrl}`);
        
        // Debug: Check if HTML contains venue data
        if (html.includes('venue') || html.includes('wedding') || html.includes('reception')) {
          console.log('✅ HTML appears to contain venue-related content');
        } else {
          console.log('⚠️ HTML may not contain venue data');
        }
        
        // Parse HTML to extract venue data
        const venues = this.parseAllVenuesFromHTML(html);
        console.log(`🎯 Extracted ${venues.length} venues from HTML`);
        
        if (venues.length > 0) {
          return venues;
        } else {
          console.log('⚠️ No venues found, trying next URL...');
        }
        
      } catch (error) {
        console.error(`❌ Error with URL ${baseUrl}:`, error);
        console.log('🔄 Trying next URL...');
        continue;
      }
    }
    
    // If all URLs failed, throw an error
    console.log('❌ All URLs failed, no real data available');
    throw new Error('Failed to fetch venue data from all attempted URLs');
  }

  async scrapeWithFetch(location: string): Promise<Venue[]> {
    console.log(`🌐 Using enhanced stealth fetch-based scraping for ${location}...`);
    
    try {
      // Convert location to URL format
      const locationSlug = this.formatLocationForUrl(location);
      const baseUrl = `https://www.theknot.com/marketplace/wedding-reception-venues/${locationSlug}`;
      
      console.log(`🌐 Fetching: ${baseUrl}`);
      
      // Add random delay to avoid rate limiting
      const delay = Math.random() * 2000 + 1000; // 1-3 seconds
      console.log(`⏳ Waiting ${Math.round(delay)}ms before request...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Enhanced stealth headers with rotation
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
      ];
      
      const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'User-Agent': randomUserAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Referer': 'https://www.google.com/',
          'Origin': 'https://www.google.com'
        },
        // Add timeout and retry logic
        signal: AbortSignal.timeout(30000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      console.log(`✅ Fetched ${html.length} characters of HTML`);
      
      // Parse HTML to extract venue data
      const venues = this.parseVenuesFromHTML(html, location);
      console.log(`🎯 Extracted ${venues.length} venues from HTML`);
      
      return venues;
              
            } catch (error) {
      console.error('❌ Fetch-based scraping failed:', error);
      throw error; // Re-throw instead of falling back to mock data
    }
  }

  private parseAllVenuesFromHTML(html: string): Venue[] {
    console.log('🔍 Parsing all venues from HTML...');
    
    try {
      // Parse real venues from The Knot HTML
      const venues = this.parseVenuesFromHTML(html, 'comprehensive');
      
      if (venues.length > 0) {
        console.log(`✅ Successfully parsed ${venues.length} real venues from HTML`);
        return venues;
      } else {
        console.log('❌ No venues found in HTML');
        throw new Error('No venues found in HTML content');
      }
    } catch (error) {
      console.error('❌ Error parsing HTML:', error);
      throw error; // Re-throw instead of falling back to mock data
    }
  }


  private parseVenuesFromHTML(html: string, location: string): Venue[] {
    console.log('🔍 Parsing venues from HTML...');
    
    const venues: Venue[] = [];
    
    try {
      // Try to extract venue data from The Knot HTML
      // Look for common patterns in The Knot's HTML structure
      
      // Pattern 1: Look for venue cards with data attributes
      const venueCardPattern = /<div[^>]*data-venue[^>]*>.*?<\/div>/g;
      const venueCards = html.match(venueCardPattern) || [];
      
      // Pattern 2: Look for JSON data in script tags
      const jsonPattern = /window\.__INITIAL_STATE__\s*=\s*({.*?});/;
      const jsonMatch = html.match(jsonPattern);
      
      // Pattern 3: Look for venue listings in structured data
      const structuredDataPattern = /"@type":\s*"LocalBusiness"[^}]*"name":\s*"([^"]*)"[^}]*"address":\s*"([^"]*)"/g;
      const structuredMatches = [...html.matchAll(structuredDataPattern)];
      
      console.log(`🔍 Found ${venueCards.length} venue cards, ${structuredMatches.length} structured data entries, ${jsonMatch ? 'JSON data found' : 'no JSON data'}`);
      
      // If we found structured data, parse it
      if (structuredMatches.length > 0) {
        for (const match of structuredMatches) {
          const name = match[1];
          const address = match[2];
          
          if (name && address) {
            venues.push({
              name: name.trim(),
              location: { 
                city: address.split(',')[0]?.trim() || 'Unknown',
                state: address.split(',')[1]?.trim() || 'Unknown',
                full: address.trim()
              },
              rating: 4.5, // Default rating
              reviewCount: 0, // Default review count
              url: `https://www.theknot.com/marketplace/venue/${name.toLowerCase().replace(/\s+/g, '-')}`,
              imageUrl: '',
              source: 'theknot',
              pricing: { min: 1000, max: 5000, currency: 'USD', description: '$$$ – Moderate' },
              description: `Beautiful venue in ${address}`,
              capacity: { min: 50, max: 200, description: 'Up to 200 Guests' },
              venueType: 'Venue',
              amenities: ['Wedding Reception', 'Ceremony'],
              specialties: ['Wedding Reception', 'Ceremony']
            });
          }
        }
      }
      
      // If no structured data found, try to extract from HTML patterns
      if (venues.length === 0) {
        // Look for venue names in common HTML patterns
        const namePattern = /<h[1-6][^>]*class="[^"]*venue[^"]*"[^>]*>([^<]+)<\/h[1-6]>/gi;
        const nameMatches = [...html.matchAll(namePattern)];
        
        for (const match of nameMatches) {
          const name = match[1].trim();
          if (name && name.length > 3) {
            venues.push({
              name: name,
              location: { 
                city: location.split(',')[0] || 'Unknown',
                state: location.split(',')[1] || 'Unknown',
                full: location
              },
              rating: 4.5,
              reviewCount: 0,
              url: `https://www.theknot.com/marketplace/venue/${name.toLowerCase().replace(/\s+/g, '-')}`,
              imageUrl: '',
              source: 'theknot',
              pricing: { min: 1000, max: 5000, currency: 'USD', description: '$$$ – Moderate' },
              description: `Beautiful venue: ${name}`,
              capacity: { min: 50, max: 200, description: 'Up to 200 Guests' },
              venueType: 'Venue',
              amenities: ['Wedding Reception', 'Ceremony'],
              specialties: ['Wedding Reception', 'Ceremony']
            });
          }
        }
      }
      
      console.log(`✅ Parsed ${venues.length} venues from HTML`);
      return venues;
      
    } catch (error) {
      console.error('❌ Error parsing HTML:', error);
      throw new Error(`Failed to parse venues from HTML: ${error}`);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
