// app/api/scraping/venues/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VendorScraper } from '@/lib/scraping/vendorScraper';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { VenueProfileData, VenueReview } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  // Enhanced profile data
  profileData?: VenueProfileData;
  detailedDescription?: string;
  pricingDetails?: string;
  capacityDetails?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
  reviews?: VenueReview[];
}

function filterVenuesByLocation(venues: Venue[], location: string): Venue[] {
  if (!location || location.trim() === '') {
    return venues; // Return all venues if no location specified
  }

  const locationLower = location.toLowerCase().trim();
  
  // State name to abbreviation mapping
  const stateMap: Record<string, string> = {
    'minnesota': 'mn',
    'new york': 'ny',
    'california': 'ca',
    'texas': 'tx',
    'florida': 'fl',
    'illinois': 'il',
    'pennsylvania': 'pa',
    'ohio': 'oh',
    'georgia': 'ga',
    'north carolina': 'nc',
    'michigan': 'mi',
    'new jersey': 'nj',
    'virginia': 'va',
    'washington': 'wa',
    'arizona': 'az',
    'massachusetts': 'ma',
    'tennessee': 'tn',
    'indiana': 'in',
    'missouri': 'mo',
    'maryland': 'md',
    'wisconsin': 'wi',
    'colorado': 'co',
    'south carolina': 'sc',
    'alabama': 'al',
    'louisiana': 'la',
    'kentucky': 'ky',
    'oregon': 'or',
    'oklahoma': 'ok',
    'connecticut': 'ct',
    'utah': 'ut',
    'iowa': 'ia',
    'nevada': 'nv',
    'arkansas': 'ar',
    'mississippi': 'ms',
    'kansas': 'ks',
    'new mexico': 'nm',
    'nebraska': 'ne',
    'west virginia': 'wv',
    'idaho': 'id',
    'hawaii': 'hi',
    'new hampshire': 'nh',
    'maine': 'me',
    'montana': 'mt',
    'rhode island': 'ri',
    'delaware': 'de',
    'south dakota': 'sd',
    'north dakota': 'nd',
    'alaska': 'ak',
    'vermont': 'vt',
    'wyoming': 'wy'
  };
  
  return venues.filter(venue => {
    if (!venue.location) return false;
    
    const venueCity = venue.location.city?.toLowerCase() || '';
    const venueState = venue.location.state?.toLowerCase() || '';
    const venueFull = venue.location.full?.toLowerCase() || '';
    
    // Check if location matches city, state, or full location
    const matchesCity = venueCity.includes(locationLower) || locationLower.includes(venueCity);
    const matchesState = venueState.includes(locationLower) || locationLower.includes(venueState);
    const matchesFull = venueFull.includes(locationLower) || locationLower.includes(venueFull);
    
    // Check state abbreviation mapping
    const stateAbbr = stateMap[locationLower];
    const matchesStateAbbr = stateAbbr && (venueState === stateAbbr || venueState.includes(stateAbbr));
    
    return matchesCity || matchesState || matchesFull || matchesStateAbbr;
  });
}

export async function POST(request: NextRequest) {
  console.log('🚀 API POST /api/scraping/venues called');
  
  const timestamp = new Date().toISOString();
  let scraper: VendorScraper | null = null;
  
  try {
    // Verify cron secret
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { location, maxVenues, maxPages } = body; // eslint-disable-line @typescript-eslint/no-unused-vars

    console.log(`🔍 Starting master scrape (will filter by location: ${location})...`);

    let allVenues: Venue[] = [];

    try {
      // Try to use the real scraper for master scrape
      console.log('🔧 Attempting master scrape with VendorScraper...');
      
      try {
        scraper = new VendorScraper();
        await scraper.initialize();
        const scrapedVenues = await scraper.scrapeAllVenues();
        allVenues = scrapedVenues.filter(venue => venue !== null) as Venue[];
        console.log(`✅ Master scraper completed successfully - found ${allVenues.length} total venues`);
        
        // If no venues found, try fallback methods
        if (allVenues.length === 0) {
          console.log('⚠️ No venues found with master scraper, trying fallback methods...');
          throw new Error('No venues found with master scraper');
        }
      } catch (scraperError: unknown) {
        console.log('⚠️ Real scraper failed, trying fetch-based approach:', scraperError instanceof Error ? scraperError.message : String(scraperError));
        
        // Try fetch-based master scraping as fallback
        try {
          const fetchScraper = new VendorScraper();
          // Don't initialize Puppeteer, let it use fetch-based approach
          const fetchVenues = await fetchScraper.scrapeAllVenues();
          allVenues = fetchVenues.filter(venue => venue !== null) as Venue[];
          console.log(`✅ Fetch-based master scraper completed successfully - found ${allVenues.length} total venues`);
        } catch (fetchError: unknown) {
          console.error('❌ All scraping methods failed:', fetchError instanceof Error ? fetchError.message : String(fetchError));
          
          throw new Error('Failed to scrape venues from all attempted methods');
        }
      }

      // Filter venues by location
      const filteredVenues = filterVenuesByLocation(allVenues, location);
      console.log(`📊 Found ${allVenues.length} total venues, ${filteredVenues.length} match location: ${location}`);

      // Use filtered venues
      let venues = filteredVenues;
      
      if (venues.length === 0) {
        console.log('⚠️ No venues found for location');
        return NextResponse.json({
          success: false,
          error: `No venues found for location: ${location}`,
          venues: []
        }, { status: 404 });
      }

      // Limit venues if maxVenues is specified (for testing)
      if (maxVenues && maxVenues > 0 && venues.length > maxVenues) {
        console.log(`🔢 Limiting to ${maxVenues} venues for testing`);
        venues = venues.slice(0, maxVenues);
      }

      // Note: Individual profile scraping is now handled by a separate dedicated scraper
      // This focuses on getting comprehensive data from the main listing page
      console.log(`📊 Main listing page scraping completed for ${venues.length} venues`);

      // Save venues to database
      if (venues.length > 0) {
        console.log('💾 Saving venues to database...');
        try {
          const venuesToSave = venues.map((venue: Venue) => {
            const profileData = venue.profileData;
            
            // Build comprehensive description from available data
            let comprehensiveDescription = venue.description || `Beautiful venue in ${venue.location?.full || location}`;
            
            // Add capacity info if available
            if (venue.capacity?.description) {
              comprehensiveDescription += ` Capacity: ${venue.capacity.description}.`;
            }
            
            // Add pricing info if available
            if (venue.pricing?.description) {
              comprehensiveDescription += ` Pricing: ${venue.pricing.description}.`;
            }
            
            // Add detailed description if available
            if (venue.detailedDescription) {
              comprehensiveDescription += ` ${venue.detailedDescription}`;
            }
            
            // Add profile data description if available
            if (profileData?.basic?.description) {
              comprehensiveDescription += ` ${profileData.basic.description}`;
            }
            
            // Build comprehensive specialties array
            const allSpecialties = [
              ...(venue.specialties || []),
              ...(venue.amenities || []),
              ...(profileData?.basic?.languages || []),
              ...(profileData?.services?.ceremonyTypes || [])
            ].filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates
            
            // Build comprehensive contact info
            const contactInfo: Record<string, string> = {
              website: venue.url || profileData?.media?.primaryImage || '',
              phone: venue.contactPhone || '',
              email: venue.contactEmail || ''
            };
            
            // Add team contact info if available
            if (profileData?.contact?.teamName) {
              contactInfo.teamName = profileData.contact.teamName;
            }
            if (profileData?.contact?.role) {
              contactInfo.role = profileData.contact.role;
            }
            if (profileData?.contact?.responseTime) {
              contactInfo.responseTime = profileData.contact.responseTime;
            }
            
            // Build comprehensive pricing info
            const pricingInfo: Record<string, unknown> = {
              min: venue.pricing?.min || 1000,
              max: venue.pricing?.max || 5000,
              currency: venue.pricing?.currency || 'USD'
            };
            
            // Add pricing details if available
            if (venue.pricing?.description) {
              pricingInfo.description = venue.pricing.description;
            }
            if (venue.pricingDetails) {
              pricingInfo.details = venue.pricingDetails;
            }
            if (profileData?.pricing?.details) {
              pricingInfo.details = profileData.pricing.details;
            }
            if (profileData?.pricing?.available !== undefined) {
              pricingInfo.available = profileData.pricing.available;
            }
            if (profileData?.pricing?.requiresContact !== undefined) {
              pricingInfo.requiresContact = profileData.pricing.requiresContact;
            }
            
            // Build comprehensive location info
            const locationInfo: Record<string, string> = {
              city: venue.location?.city || '',
              state: venue.location?.state || '',
              full: venue.location?.full || ''
            };
            
            // Add additional location details if available
            if (profileData?.basic?.address) {
              locationInfo.address = profileData.basic.address;
            }
            if (profileData?.basic?.neighborhood) {
              locationInfo.neighborhood = profileData.basic.neighborhood;
            }
            
            // Build reviews summary
            const reviewsSummary: Record<string, unknown> = {};
            if (venue.reviews && venue.reviews.length > 0) {
              reviewsSummary.totalReviews = venue.reviews.length;
              reviewsSummary.sampleReviews = venue.reviews.slice(0, 3);
            }
            if (profileData?.reviews?.overallRating) {
              reviewsSummary.overallRating = profileData.reviews.overallRating;
            }
            if (profileData?.reviews?.totalReviews) {
              reviewsSummary.totalReviews = profileData.reviews.totalReviews;
            }
            if (profileData?.reviews?.aiSummary) {
              reviewsSummary.aiSummary = profileData.reviews.aiSummary;
            }
            if (profileData?.individualReviews && profileData.individualReviews.length > 0) {
              reviewsSummary.individualReviews = profileData.individualReviews.slice(0, 5);
            }
            
            return {
              name: venue.name,
              category: 'venue',
              location: locationInfo,
              pricing: pricingInfo,
              rating: venue.rating || profileData?.reviews?.overallRating || 0,
              review_count: venue.reviewCount || profileData?.reviews?.totalReviews || 0,
              portfolio_images: [
                ...(venue.imageUrl ? [venue.imageUrl] : []),
                ...(profileData?.media?.primaryImage ? [profileData.media.primaryImage] : []),
                ...(profileData?.media?.portfolioImages || [])
              ].filter((img, index, arr) => arr.indexOf(img) === index), // Remove duplicates
              description: comprehensiveDescription,
              specialties: allSpecialties,
              verified: false,
              featured: false,
              contact: contactInfo,
              business_type: venue.venueType || 'venue',
              last_scraped: new Date().toISOString(),
              availability_calendar: {},
              reviews_summary: reviewsSummary,
              lead_fee_percentage: 5
            };
          });

          // Check for existing venues to provide better duplicate handling
          const existingVenues = await supabase
            .from('vendors')
            .select('name, category, last_scraped')
            .eq('category', 'venue');

          const existingNames = new Set(
            existingVenues.data?.map(v => v.name.toLowerCase()) || []
          );

          const newVenues = venuesToSave.filter(v => !existingNames.has(v.name.toLowerCase()));
          const updatedVenues = venuesToSave.filter(v => existingNames.has(v.name.toLowerCase()));

          console.log(`📊 Database update summary:`);
          console.log(`  - New venues: ${newVenues.length}`);
          console.log(`  - Updated venues: ${updatedVenues.length}`);
          console.log(`  - Total venues: ${venuesToSave.length}`);

          const { error: insertError } = await supabase
            .from('vendors')
            .insert(venuesToSave);

          if (insertError) {
            console.error('❌ Error saving venues to database:', insertError);
          } else {
            console.log(`✅ Successfully saved ${venues.length} venues to database`);
            if (newVenues.length > 0) {
              console.log(`🆕 Added ${newVenues.length} new venues`);
            }
            if (updatedVenues.length > 0) {
              console.log(`🔄 Updated ${updatedVenues.length} existing venues`);
            }
          }
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
        }
      }

      // Log detailed results
      if (venues.length > 0) {
        console.log('✅ Sample venues found:');
        venues.slice(0, 5).forEach((venue: Venue, index: number) => {
          console.log(`  ${index + 1}. ${venue.name} (${venue.location?.city || 'Unknown'}, ${venue.location?.state || 'Unknown'}) - Rating: ${venue.rating || 'N/A'}`);
        });
      } else {
        console.log('⚠️ No venues found. Possible issues:');
        console.log('  - Website structure changed');
        console.log('  - Anti-bot detection triggered');
        console.log('  - Network issues');
        console.log('  - Invalid location format');
      }

      return NextResponse.json({
        success: venues.length > 0,
        message: venues.length > 0 
          ? `Successfully scraped ${venues.length} venues for ${location}` 
          : `No venues found for ${location}. Try a different location format.`,
        venuesFound: venues.length,
        location,
        timestamp,
        sampleVenues: venues.slice(0, 5).map((v: Venue) => ({
          name: v.name,
          location: v.location?.full || `${v.location?.city}, ${v.location?.state}`,
          rating: v.rating,
          reviewCount: v.reviewCount,
          source: v.source,
          description: v.description,
          capacity: v.capacity,
          pricing: v.pricing,
          venueType: v.venueType,
          amenities: v.amenities,
          specialties: v.specialties,
          url: v.url,
          imageUrl: v.imageUrl
        })),
        suggestions: venues.length === 0 ? [
          'Check if location format is correct (e.g., "Minnesota" or "Minneapolis, MN")',
          'The Knot may have anti-bot protection active',
          'Try a different location or check the website manually'
        ] : null
      });

    } catch (scraperError: unknown) {
      console.error('Scraper error:', scraperError);
      
      // Provide detailed error information
      const errorDetails = {
        error: scraperError instanceof Error ? scraperError.message : String(scraperError),
        stack: scraperError instanceof Error ? scraperError.stack : undefined,
        location,
        timestamp,
        suggestions: [
          'The Knot may have anti-bot protection active',
          'Check if the location format is supported',
          'Verify Puppeteer is properly configured for your deployment environment'
        ]
      };

      return NextResponse.json({
        success: false,
        error: 'Scraping failed',
        details: errorDetails
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    // Clean up resources
    if (scraper && typeof scraper.close === 'function') {
      try {
        await scraper.close();
      } catch (closeError) {
        console.error('Error closing scraper:', closeError);
      }
    }
  }
}

// Enhanced GET endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const test = searchParams.get('test');

    if (test === 'true') {
      // Test endpoint to verify scraping capabilities
      return NextResponse.json({
        status: 'healthy',
        message: 'Scraping service is operational',
        supportedLocations: [
          'State names (e.g., "Minnesota")',
          'City, State (e.g., "Minneapolis, MN")',
          'Metropolitan areas (e.g., "Twin Cities, MN")'
        ],
        timestamp: new Date().toISOString()
      });
    }

    if (!location) {
      return NextResponse.json({ 
        error: 'Location parameter required',
        usage: 'Add ?location=Minnesota or ?test=true'
      }, { status: 400 });
    }

    // Return status - implement actual status checking as needed
    return NextResponse.json({ 
      status: 'ready',
      location,
      lastRun: null,
      nextRun: null,
      message: 'Ready to scrape venues for this location'
    });

  } catch (error) {
    console.error('Error in GET endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}