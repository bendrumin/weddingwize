// lib/scraping/venueProfileScraper.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { VenueProfileData, VenueReview } from '../../types';

export class VenueProfileScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing VenueProfileScraper...');
      
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set user agent to avoid detection
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await this.page.setViewport({ width: 1366, height: 768 });

      // Override navigator properties to avoid detection
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      console.log('✅ VenueProfileScraper initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize VenueProfileScraper:', error);
      throw error;
    }
  }

  async scrapeVenueProfile(venueUrl: string): Promise<VenueProfileData | null> {
    if (!this.page) {
      console.log('⚠️ VenueProfileScraper not initialized');
      return null;
    }

    try {
      console.log(`🔍 Scraping venue profile from: ${venueUrl}`);
      await this.page.goto(venueUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));

      const profileData = await this.page.evaluate(() => {
        // Helper functions
        const getText = (selector: string): string => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() || '';
        };

        const getTexts = (selector: string): string[] => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent?.trim() || '').filter(text => text.length > 0);
        };

        const exists = (selector: string): boolean => {
          return document.querySelector(selector) !== null;
        };

        // Extract basic information
        const basic = {
          name: getText('h1, .venue-name, .business-name, [data-testid="business-name"]'),
          tagline: getText('.tagline, .subtitle, .venue-tagline, [class*="tagline"]'),
          description: getText('.description, .venue-description, .about, [class*="description"]'),
          address: getText('.address, .location, [data-testid="address"], [class*="address"]'),
          neighborhood: getText('.neighborhood, .area, [class*="neighborhood"]'),
          businessType: getText('.business-type, .venue-type, [class*="business-type"]'),
          languages: getTexts('.language, .languages li, [class*="language"]')
        };

        // Extract capacity information
        const capacity = {
          guestRange: getText('.capacity, .guest-range, .max-guests, [class*="capacity"]'),
          maxCapacity: parseInt(getText('.max-capacity, .capacity-number, [class*="max-capacity"]')) || 0,
          capacityDescription: getText('.capacity-description, .guest-info, [class*="capacity-description"]')
        };

        // Extract services
        const services = {
          ceremoniesAndReceptions: exists('.ceremony, .reception, [class*="ceremony"], [class*="reception"]'),
          ceremonyTypes: getTexts('.ceremony-type, .ceremony-option, [class*="ceremony-type"]')
        };

        // Extract contact information
        const contact = {
          teamName: getText('.team-name, .contact-name, .venue-contact, [class*="team-name"]'),
          role: getText('.role, .position, .title, [class*="role"]'),
          responseTime: getText('.response-time, .response, [class*="response-time"]'),
          contactForm: exists('.contact-form, .inquiry-form, [class*="contact-form"]')
        };

        // Extract awards
        const awards = {
          awardCount: parseInt(getText('.award-count, .awards-count, [class*="award-count"]')) || 0,
          awardType: getText('.award-type, .award-name, [class*="award-type"]'),
          awardSource: getText('.award-source, .award-from, [class*="award-source"]')
        };

        // Extract pricing
        const pricing = {
          available: exists('.pricing, .rates, .prices, [class*="pricing"]'),
          details: getText('.pricing-details, .rate-info, .price-info, [class*="pricing-details"]'),
          requiresContact: exists('.contact-for-pricing, .pricing-contact, [class*="pricing-contact"]')
        };

        // Extract amenities
        const amenities = {
          ceremonyArea: exists('.ceremony-area, .ceremony-space, [class*="ceremony-area"]'),
          coveredOutdoorsSpace: exists('.covered-outdoor, .covered-space, [class*="covered-outdoor"]'),
          dressingRoom: exists('.dressing-room, .bridal-suite, [class*="dressing-room"]'),
          handicapAccessible: exists('.accessible, .handicap, .wheelchair, [class*="accessible"]'),
          indoorEventSpace: exists('.indoor, .inside, [class*="indoor"]'),
          liabilityInsurance: exists('.insurance, .liability, [class*="insurance"]'),
          outdoorEventSpace: exists('.outdoor, .outside, .garden, [class*="outdoor"]'),
          receptionArea: exists('.reception, .reception-space, [class*="reception-area"]'),
          wirelessInternet: exists('.wifi, .internet, .wireless, [class*="wifi"]')
        };

        // Extract venue settings
        const settings = {
          ballroom: exists('.ballroom, [class*="ballroom"]'),
          garden: exists('.garden, [class*="garden"]'),
          historicVenue: exists('.historic, .historical, [class*="historic"]'),
          industrialWarehouse: exists('.industrial, .warehouse, [class*="industrial"]'),
          trees: exists('.trees, .wooded, [class*="trees"]')
        };

        // Extract service offerings
        const serviceOfferings = {
          barAndDrinks: {
            available: exists('.bar, .drinks, .beverage, [class*="bar"]'),
            barRental: exists('.bar-rental, .bar-service, [class*="bar-rental"]')
          },
          cakesAndDesserts: {
            available: exists('.cake, .dessert, .sweets, [class*="cake"]'),
            cupcakes: exists('.cupcake, [class*="cupcake"]'),
            otherDesserts: exists('.dessert, .sweets, [class*="dessert"]')
          },
          foodAndCatering: {
            available: exists('.catering, .food, .dining, [class*="catering"]')
          },
          planning: {
            available: exists('.planning, .coordination, .coordinator, [class*="planning"]'),
            seHablaEspanol: exists('.spanish, .espanol, [class*="spanish"]'),
            weddingDesign: exists('.design, .styling, [class*="design"]')
          },
          rentalsAndEquipment: {
            available: exists('.rental, .equipment, [class*="rental"]'),
            tents: exists('.tent, .tenting, [class*="tent"]')
          },
          serviceStaff: {
            available: exists('.staff, .service, .servers, [class*="staff"]')
          },
          transportation: {
            available: exists('.transportation, .shuttle, .transport, [class*="transportation"]'),
            shuttleService: exists('.shuttle, .shuttle-service, [class*="shuttle"]')
          }
        };

        // Extract reviews
        const reviews = {
          overallRating: parseFloat(getText('.rating, .overall-rating, [class*="rating"]')) || 0,
          totalReviews: parseInt(getText('.review-count, .total-reviews, [class*="review-count"]')) || 0,
          ratingBreakdown: {
            fiveStars: parseInt(getText('.five-stars, [class*="five-stars"]')) || 0,
            fourStars: parseInt(getText('.four-stars, [class*="four-stars"]')) || 0,
            threeStars: parseInt(getText('.three-stars, [class*="three-stars"]')) || 0,
            twoStars: parseInt(getText('.two-stars, [class*="two-stars"]')) || 0,
            oneStar: parseInt(getText('.one-star, [class*="one-star"]')) || 0
          },
          aiSummary: getText('.ai-summary, .review-summary, .summary, [class*="ai-summary"]'),
          sortOptions: getTexts('.sort-option, .review-sort option, .filter-option, [class*="sort-option"]')
        };

        // Extract individual reviews
        const individualReviews: VenueReview[] = [];
        const reviewElements = document.querySelectorAll('.review, .review-item, [class*="review"]');
        reviewElements.forEach((reviewEl, index) => {
          if (index < 10) { // Limit to first 10 reviews
            // Helper functions for review elements
            const getReviewText = (selector: string): string => {
              const element = reviewEl.querySelector(selector);
              return element?.textContent?.trim() || '';
            };

            const reviewExists = (selector: string): boolean => {
              return reviewEl.querySelector(selector) !== null;
            };

            const author = getReviewText('.author, .reviewer, .name, [class*="author"]');
            const rating = parseFloat(getReviewText('.rating, .stars, [class*="rating"]')) || 0;
            const date = getReviewText('.date, .review-date, [class*="date"]');
            const content = getReviewText('.content, .review-text, .comment, [class*="content"]');
            const highlighted = reviewExists('.highlighted, .featured, [class*="highlighted"]');

            if (author && content) {
              individualReviews.push({
                author,
                rating,
                date,
                content,
                highlighted
              });
            }
          }
        });

        // Extract team information
        const team = {
          teamName: getText('.team-name, .staff-name, [class*="team-name"]'),
          role: getText('.team-role, .staff-role, [class*="team-role"]'),
          description: getText('.team-description, .staff-description, [class*="team-description"]'),
          teamMessage: getText('.team-message, .staff-message, [class*="team-message"]')
        };

        // Extract media
        const media = {
          primaryImage: getText('.primary-image img, .hero-image img, [class*="primary-image"] img') || '',
          portfolioImages: Array.from(document.querySelectorAll('.portfolio img, .gallery img, [class*="portfolio"] img')).map(img => img.src || ''),
          reviewPhotos: Array.from(document.querySelectorAll('.review-photo img, .review-image img, [class*="review-photo"] img')).map(img => img.src || '')
        };

        return {
          basic,
          capacity,
          amenities,
          settings,
          reviews,
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

      console.log('✅ Venue profile extracted successfully');
      return profileData;
    } catch (error) {
      console.error(`❌ Error scraping venue profile from ${venueUrl}:`, error);
      return null;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log('🔒 VenueProfileScraper closed');
    }
  }
}
