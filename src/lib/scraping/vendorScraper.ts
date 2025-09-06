// lib/scraping/vendorScraper.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { VenueProfileData, VenueReview } from '../../types';

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

export class VendorScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    console.log('🚀 Initializing Puppeteer browser...');
    
    try {
      // For Vercel deployment, you might need to use browserless.io or similar
    this.browser = await puppeteer.launch({
        headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });
      console.log('✅ Browser launched successfully');
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
        
        // Set user agent to avoid detection
        await this.page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        console.log('✅ User agent set');
    
    // Set viewport
        await this.page.setViewport({ width: 1920, height: 1080 });
        console.log('✅ Viewport set');
        
        console.log('✅ Puppeteer browser initialized');
      } catch (error: unknown) {
        console.error('❌ Failed to create page or set properties:', error);
        this.browser = null;
        this.page = null;
        console.log('⚠️ Page creation failed, scraper will use fallback methods');
      }
    }
  }

  async scrapeVenueDetails(venueUrl: string): Promise<Partial<Venue> | null> {
    try {
      console.log(`🔍 Scraping detailed info from: ${venueUrl}`);
      
      await this.page!.goto(venueUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const detailedInfo = await this.page!.evaluate(() => {
        const result: any = {};
        
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
        const contactInfo: any = {};
        
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
        const reviews: any[] = [];
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

  async scrapeVenues(location: string, maxPages: number = 50) {
    if (!this.page) {
      console.log('⚠️ Puppeteer not available, returning mock data');
      return this.getMockVenues(location);
    }

    console.log(`🔍 Scraping venues for ${location}...`);
    
    // Convert location to URL format (e.g., "Minnesota" -> "minnesota")
    const locationSlug = this.formatLocationForUrl(location);
    const baseUrl = `https://www.theknot.com/marketplace/wedding-reception-venues/${locationSlug}`;
    
    console.log(`🌐 Navigating to: ${baseUrl}`);
    
    try {
      // Navigate to the page
      await this.page.goto(baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait a bit for the page to load, then proceed
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('📋 Page loaded, extracting venue data...');

      // Extract venue data
      const venues = await this.page.evaluate(() => {
        // Try multiple selectors as The Knot may change their structure
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

        console.log(`Found ${venueCards.length} venue cards`);
        
        // Debug: log the first few cards to see what we're working with
        if (venueCards.length > 0) {
          console.log('First card text:', venueCards[0].textContent?.trim().substring(0, 100));
          console.log('First card classes:', venueCards[0].className);
          
          // Debug: Show all venue names found
          console.log('🔍 All venue names found:');
          Array.from(venueCards).slice(0, 5).forEach((card, i) => {
            const text = card.textContent?.trim() || '';
            const nameMatch = text.match(/^([^0-9]+?)(\d+\.?\d*\(\d+\))/);
            const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
            console.log(`  ${i + 1}. ${name}`);
          });
        }

        return Array.from(venueCards).map((card: Element) => {
          try {
            // Skip navigation/header elements
            const cardText = card.textContent?.trim() || '';
            if (cardText.includes('Are you a vendor') || 
                cardText.includes('Start here') || 
                cardText.length < 20 ||
                !cardText.match(/\d+\.?\d*\(\d+\)/)) { // Must have rating pattern
              return null;
            }
            
            // Extract venue name - try multiple approaches
            let name = 'Unknown Venue';
            
            // Try to find name in various ways
            const nameSelectors = [
              '.vendor-name--e997e',
              '.vendor-name--f264c',
              '[data-testid="vendor-name"]',
              '.vendor-name',
              '.vendor-title',
              'h3',
              'h2',
              '.result-title',
              'a[href*="/marketplace/"]',
              '.vendor-link'
            ];
            
            for (const selector of nameSelectors) {
              const element = card.querySelector(selector);
              if (element && element.textContent?.trim()) {
                name = element.textContent.trim();
                break;
              }
            }
            
            // If still no name, try to get the first line of text from the card
            if (name === 'Unknown Venue') {
              const allText = card.textContent?.trim();
              if (allText) {
                // Take the first line of text as the name (before any numbers/ratings)
                const firstLine = allText.split(/[\d\(\)]/)[0].trim();
                if (firstLine.length > 3) {
                  name = firstLine;
                }
              }
            }

            // Extract location, rating, and other info from card text
            // (cardText already declared above)
            let locationText = '';
            let city = '';
            let state = '';
            let rating = 0;
            let reviewCount = 0;
            let capacity = '';
            let pricingText = '';
            
            // Parse the card text which contains: "Venue Name4.9(130)Minneapolis, MNUp to 250 Guests$$ – Affordable"
            
            // Extract rating (4.9(130) pattern)
            const ratingMatch = cardText.match(/(\d+\.?\d*)\((\d+)\)/);
            if (ratingMatch) {
              rating = parseFloat(ratingMatch[1]);
              reviewCount = parseInt(ratingMatch[2]);
              
              // Cap rating at 5.0 to prevent database overflow
              if (rating > 5.0) {
                rating = 5.0;
                console.log(`⚠️ Rating capped at 5.0 for ${name} (was ${ratingMatch[1]})`);
              }
              
              console.log(`✅ Extracted rating: ${rating} (${reviewCount} reviews) for ${name}`);
            } else {
              console.log(`❌ No rating found in card text: "${cardText.substring(0, 100)}..."`);
            }
            
            // Extract location (City, State pattern) - look after the rating
            const locationMatch = cardText.match(/([A-Za-z\s]+),\s*([A-Z]{2})/);
            if (locationMatch) {
              locationText = locationMatch[0];
              city = locationMatch[1].trim();
              state = locationMatch[2].trim();
              console.log(`✅ Extracted location: ${locationText} for ${name}`);
            }
            
            // Extract capacity (Up to X Guests or X+ Guests pattern)
            const capacityMatch = cardText.match(/(Up to \d+ Guests|\d+\+ Guests)/);
            if (capacityMatch) {
              capacity = capacityMatch[1];
              console.log(`✅ Extracted capacity: ${capacity} for ${name}`);
            } else {
              console.log(`❌ No capacity found in card text: "${cardText.substring(0, 100)}..."`);
            }
            
            // Extract capacity numbers for database
            let capacityMin = 0;
            let capacityMax = 0;
            if (capacity.includes('Up to')) {
              capacityMax = parseInt(capacity.match(/\d+/)?.[0] || '0');
              capacityMin = Math.floor(capacityMax * 0.5); // Estimate min as 50% of max
            } else if (capacity.includes('+')) {
              capacityMin = parseInt(capacity.match(/\d+/)?.[0] || '0');
              capacityMax = capacityMin * 2; // Estimate max as 2x min
            }
            
            // Extract pricing ($$ – Affordable, $$$ – Moderate, etc.)
            const pricingMatch = cardText.match(/(\$\$+[^$]*)/);
            if (pricingMatch) {
              pricingText = pricingMatch[1];
              console.log(`✅ Extracted pricing: ${pricingText} for ${name}`);
            } else {
              console.log(`❌ No pricing found in card text: "${cardText.substring(0, 100)}..."`);
            }

            // Extract pricing information from card text
            let pricingMin = 1000;
            let pricingMax = 5000;
            
            // Use the extracted pricing text to determine price ranges
            if (pricingText.includes('$$ – Affordable')) {
              pricingMin = 1000;
              pricingMax = 3000;
            } else if (pricingText.includes('$$$ – Moderate')) {
              pricingMin = 3000;
              pricingMax = 6000;
            } else if (pricingText.includes('$$$$ – Expensive')) {
              pricingMin = 6000;
              pricingMax = 12000;
            } else if (pricingText.includes('$$$$$ – Very Expensive')) {
              pricingMin = 12000;
              pricingMax = 25000;
            } else {
              // Look for specific price ranges in the full text
              const priceRangeMatch = cardText.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
              if (priceRangeMatch) {
                pricingMin = parseInt(priceRangeMatch[1].replace(/,/g, ''));
                pricingMax = parseInt(priceRangeMatch[2].replace(/,/g, ''));
              } else {
                const startingPriceMatch = cardText.match(/starting\s*at\s*\$([\d,]+)/i);
                if (startingPriceMatch) {
                  pricingMin = parseInt(startingPriceMatch[1].replace(/,/g, ''));
                  pricingMax = pricingMin * 2;
                }
              }
            }

            // Extract URL
            const linkElement = card.querySelector('a[href*="/marketplace/"]');
            const relativeUrl = linkElement?.getAttribute('href') || '';
            const url = relativeUrl.startsWith('http') ? relativeUrl : `https://www.theknot.com${relativeUrl}`;
            
            // Debug URL extraction (moved outside page.evaluate)

            // Extract image
            const imageElement = card.querySelector('img');
            const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src') || '';


            // Create a better description with extracted information
            let description = `Beautiful venue in ${locationText || 'Minnesota'}`;
            
            // Build a more detailed description
            const descriptionParts = [];
            if (capacity) {
              descriptionParts.push(`Capacity: ${capacity}`);
            }
            if (pricingText) {
              descriptionParts.push(`Pricing: ${pricingText}`);
            }
            if (rating > 0) {
              descriptionParts.push(`${rating} stars (${reviewCount} reviews)`);
            }
            
            // Add venue type based on name patterns
            let venueType = 'Event Venue';
            if (name.toLowerCase().includes('hotel') || name.toLowerCase().includes('hilton')) {
              venueType = 'Hotel';
            } else if (name.toLowerCase().includes('inn')) {
              venueType = 'Inn';
            } else if (name.toLowerCase().includes('center') || name.toLowerCase().includes('event')) {
              venueType = 'Event Center';
            } else if (name.toLowerCase().includes('garden') || name.toLowerCase().includes('park')) {
              venueType = 'Garden Venue';
            }
            
            if (descriptionParts.length > 0) {
              description = `${venueType} in ${locationText || 'Minnesota'}. ${descriptionParts.join(', ')}.`;
            } else {
              description = `${venueType} in ${locationText || 'Minnesota'}`;
            }
            
            // Try to find additional description text from the page
            const descriptionSelectors = [
              '.description',
              '.venue-description',
              '[class*="description"]',
              'p'
            ];
            
            for (const selector of descriptionSelectors) {
              const element = card.querySelector(selector);
              if (element && element.textContent?.trim() && element.textContent.length > 20) {
                const additionalDesc = element.textContent.trim().substring(0, 100);
                if (!description.includes(additionalDesc)) {
                  description += ` ${additionalDesc}`;
                }
                break;
              }
            }

            // Extract amenities and features from the card
            const amenities: string[] = [];
            const amenitySelectors = [
              '.amenity',
              '.feature',
              '.tag',
              '[class*="amenity"]',
              '[class*="feature"]',
              '[class*="tag"]'
            ];
            
            for (const selector of amenitySelectors) {
              const elements = card.querySelectorAll(selector);
              elements.forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 0 && text.length < 50) {
                  amenities.push(text);
                }
              });
            }

            // Extract venue type from badges or tags
            let extractedVenueType = venueType;
            const badgeSelectors = [
              '.badge',
              '.tag',
              '.label',
              '[class*="badge"]',
              '[class*="tag"]',
              '[class*="label"]'
            ];
            
            for (const selector of badgeSelectors) {
              const elements = card.querySelectorAll(selector);
              elements.forEach(el => {
                const text = el.textContent?.trim().toLowerCase();
                if (text && (text.includes('hotel') || text.includes('garden') || text.includes('historic') || 
                           text.includes('outdoor') || text.includes('indoor') || text.includes('ballroom'))) {
                  extractedVenueType = text;
                }
              });
            }
      
            const result = {
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
                min: pricingMin,
                max: pricingMax,
                currency: 'USD',
                description: pricingText
              },
              description,
              capacity: {
                min: capacityMin,
                max: capacityMax,
                description: capacity
              },
              venueType: extractedVenueType,
              amenities: amenities.length > 0 ? amenities : ['Wedding Reception', 'Ceremony', 'Corporate Events'],
              specialties: ['Wedding Reception', 'Ceremony', 'Corporate Events'],
              // Debug info
              debug: {
                cardText: cardText.substring(0, 200),
                hasRating: !!ratingMatch,
                hasLocation: !!locationMatch,
                hasCapacity: !!capacityMatch,
                hasPricing: !!pricingMatch
              }
            };
            
            return result;
          } catch (error) {
            console.error('Error extracting venue data:', error);
            return null;
          }
        }).filter(venue => venue !== null && venue.name !== 'Unknown Venue');
      });

      console.log(`✅ Extracted ${venues.length} venues`);
      
      // Debug: Show final venue names
      if (venues.length > 0) {
        console.log('🎯 Final venue names:');
        venues.slice(0, 5).forEach((venue, i) => {
          console.log(`  ${i + 1}. ${venue?.name || 'Unknown'}`);
        });
      }
      
      // Debug: Show first venue's debug info
      if (venues.length > 0) {
        const firstVenue = venues[0];
        if (firstVenue) {
          console.log(`🔍 Debug info for first venue:`, {
            name: firstVenue.name,
            debug: firstVenue.debug,
            hasDescription: !!firstVenue.description,
            hasCapacity: !!firstVenue.capacity?.description,
            hasPricing: !!firstVenue.pricing?.description
          });
        }
      }

      // Enhance venues with detailed information (optional - can be enabled/disabled)
      const shouldScrapeDetails = process.env.SCRAPE_DETAILED_INFO === 'true';
      if (shouldScrapeDetails && venues.length > 0) {
        console.log(`🔍 Enhancing venues with detailed information...`);
        
        for (let i = 0; i < Math.min(venues.length, 5); i++) { // Limit to first 5 venues for performance
          const venue = venues[i];
          if (venue && venue.url && venue.url.includes('theknot.com')) {
            try {
              console.log(`📋 Scraping details for: ${venue?.name || 'Unknown'}`);
              const detailedInfo = await this.scrapeVenueDetails(venue!.url);
              
              if (detailedInfo) {
                // Merge detailed information
                if ((detailedInfo as any).detailedDescription) {
                  (venue as any).description = (detailedInfo as any).detailedDescription;
                }
                if (detailedInfo.amenities && detailedInfo.amenities.length > 0) {
                  (venue as any).amenities = detailedInfo.amenities;
                }
                if (detailedInfo.portfolioImages && detailedInfo.portfolioImages.length > 0) {
                  (venue as any).portfolioImages = detailedInfo.portfolioImages;
                }
                if (detailedInfo.contact) {
                  (venue as any).contact = { ...(venue as any).contact, ...detailedInfo.contact };
                }
                if (detailedInfo.pricingDetails) {
                  (venue as any).pricingDetails = detailedInfo.pricingDetails;
                }
                if (detailedInfo.capacityDetails) {
                  (venue as any).capacityDetails = detailedInfo.capacityDetails;
                }
                if (detailedInfo.reviews && detailedInfo.reviews.length > 0) {
                  (venue as any).reviews = detailedInfo.reviews;
                }
                
                console.log(`✅ Enhanced ${venue?.name || 'Unknown'} with detailed info`);
              }
              
              // Add delay between detailed scraping to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 3000));
              
            } catch (error) {
              console.error(`❌ Error enhancing venue ${venue?.name || 'Unknown'}:`, error);
            }
          }
        }
      }

      // Handle pagination if needed
      if (maxPages > 1 && venues.length > 0) {
        for (let page = 2; page <= maxPages; page++) {
          try {
            console.log(`📄 Loading page ${page}...`);
            
            // Try to find and click the next button
            const nextButtonClicked = await this.page.evaluate(() => {
              // First, try common pagination selectors
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
                if (element && element.offsetParent !== null) { // Check if visible
                  element.click();
                  return true;
                }
              }
              
              // Look for buttons/links containing "Next" text (case insensitive)
              const buttons = document.querySelectorAll('button, a');
              for (const button of buttons) {
                const text = button.textContent?.toLowerCase().trim();
                if (text && (text.includes('next') || text.includes('→') || text.includes('>')) && (button as HTMLElement).offsetParent !== null) {
                  (button as HTMLElement).click();
                  return true;
                }
              }
              
              // Look for numbered pagination (e.g., "2", "3", etc.)
              const pageNumbers = document.querySelectorAll('button, a');
              for (const pageNum of pageNumbers) {
                const text = pageNum.textContent?.trim();
                if (text === page.toString() && (pageNum as HTMLElement).offsetParent !== null) {
                  (pageNum as HTMLElement).click();
                  return true;
                }
              }
              
              return false;
            });

            if (nextButtonClicked) {
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for new content
              console.log(`✅ Successfully navigated to page ${page}`);
              
              // Extract venues from this page using the same logic
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
                    
                    // Extract basic info (simplified for pagination)
                    const nameMatch = cardText.match(/^([^0-9]+?)(\d+\.?\d*\(\d+\))/);
                    const name = nameMatch ? nameMatch[1].trim() : 'Unknown Venue';
                    
                    // Extract rating
                    const ratingMatch = cardText.match(/(\d+\.?\d*)\((\d+)\)/);
                    let rating = 0;
                    let reviewCount = 0;
                    if (ratingMatch) {
                      rating = parseFloat(ratingMatch[1]);
                      reviewCount = parseInt(ratingMatch[2]);
                      // Cap rating at 5.0
                      if (rating > 5.0) rating = 5.0;
                    }
                    
                    // Extract location
                    const locationMatch = cardText.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*, [A-Z]{2})/);
                    const locationText = locationMatch ? locationMatch[1] : 'Unknown, Unknown';
                    const [city, state] = locationText.split(', ').map(s => s.trim());
                    
                    // Extract URL
                    const linkElement = card.querySelector('a[href*="/marketplace/"]');
                    const relativeUrl = linkElement?.getAttribute('href') || '';
                    const url = relativeUrl.startsWith('http') ? relativeUrl : `https://www.theknot.com${relativeUrl}`;
                    
                    // Extract image
                    const imageElement = card.querySelector('img');
                    const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src') || '';
                    
                    // Extract capacity
                    const capacityMatch = cardText.match(/(Up to \d+ Guests|\d+\+ Guests)/);
                    const capacity = capacityMatch ? capacityMatch[1] : 'Unknown';
                    
                    // Extract pricing
                    const pricingMatch = cardText.match(/(\$\$+[^$]*)/);
                    const pricingText = pricingMatch ? pricingMatch[1] : 'Unknown';
                    
                    // Create description
                    const description = `Beautiful venue in ${locationText}`;
                    
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
                  } catch (error) {
                    return null;
                  }
                }).filter(venue => venue !== null && venue.name !== 'Unknown Venue');
              });
              
              // Add debug property to each venue and ensure all required properties
              const venuesWithDebug = pageVenues.map(venue => ({
                ...venue,
                name: venue?.name || 'Unknown Venue',
                location: venue?.location || { city: '', state: '', full: '' },
                rating: venue?.rating || 0,
                reviewCount: venue?.reviewCount || 0,
                url: venue?.url || '',
                imageUrl: venue?.imageUrl || '',
                source: venue?.source || 'theknot.com',
                pricing: venue?.pricing || { min: 0, max: 0, currency: 'USD', description: '' },
                description: venue?.description || '',
                capacity: venue?.capacity || { min: 0, max: 0, description: '' },
                venueType: venue?.venueType || 'Wedding Venue',
                amenities: venue?.amenities || [],
                specialties: venue?.specialties || [],
                debug: {
                  cardText: '',
                  hasDescription: false,
                  hasCapacity: false,
                  hasPricing: false
                }
              }));
              venues.push(...venuesWithDebug);
              console.log(`✅ Added ${pageVenues.length} venues from page ${page}`);
            } else {
              console.log('🚫 No more pages available');
              break;
            }
          } catch (error) {
            console.error(`Error loading page ${page}:`, error);
            break;
          }
        }
      }

      // Debug URLs for first few venues
      console.log('🔗 Sample URLs extracted:');
      venues.slice(0, 3).forEach((venue, index) => {
        console.log(`  ${index + 1}. ${venue?.name || 'Unknown'}: ${venue?.url || 'No URL'}`);
      });

      return venues;

    } catch (error) {
      console.error('Error scraping venues:', error);
      throw error;
    }
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

  private getMockVenues(location: string): Venue[] {
    console.log(`🎭 Returning mock venues for ${location}`);
    return [
      {
        name: 'Mock Venue 1',
        location: { city: 'Minneapolis', state: 'MN', full: 'Minneapolis, MN' },
        rating: 4.5,
        reviewCount: 25,
        url: 'https://example.com',
        imageUrl: '',
        source: 'mock'
      },
      {
        name: 'Mock Venue 2', 
        location: { city: 'St. Paul', state: 'MN', full: 'St. Paul, MN' },
        rating: 4.2,
        reviewCount: 18,
        url: 'https://example.com',
        imageUrl: '',
        source: 'mock'
      }
    ];
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}
