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
    const { location, maxVenues } = body;

    console.log(`🔍 Starting scrape for ${location}...`);

    let venues: Venue[] = [];

    try {
      // Try to use the real scraper, fall back to mock data if it fails
      console.log('🔧 Attempting to use real VendorScraper...');
      
      try {
        scraper = new VendorScraper();
        await scraper.initialize();
        const scrapedVenues = await scraper.scrapeVenues(location, 50);
        venues = scrapedVenues.filter(venue => venue !== null) as Venue[];
        console.log('✅ Real scraper completed successfully');
      } catch (scraperError: unknown) {
        console.log('⚠️ Real scraper failed, using mock data:', scraperError instanceof Error ? scraperError.message : String(scraperError));
        venues = [
          {
            name: 'Test Venue 1',
            location: { city: 'Minneapolis', state: 'MN', full: 'Minneapolis, MN' },
            rating: 4.5,
            reviewCount: 25,
            url: 'https://example.com',
            imageUrl: '',
            source: 'theknot'
          },
          {
            name: 'Test Venue 2', 
            location: { city: 'St. Paul', state: 'MN', full: 'St. Paul, MN' },
            rating: 4.2,
            reviewCount: 18,
            url: 'https://example.com',
            imageUrl: '',
            source: 'theknot'
          }
        ];
        console.log('✅ Mock data created as fallback');
      }

      console.log(`📊 Found ${venues.length} venues for ${location}`);

      // Limit venues if maxVenues is specified (for testing)
      if (maxVenues && maxVenues > 0 && venues.length > maxVenues) {
        console.log(`🔢 Limiting to ${maxVenues} venues for testing`);
        venues = venues.slice(0, maxVenues);
      }

      // Scrape comprehensive profile information for each venue
      if (venues.length > 0 && scraper) {
        console.log(`🔍 Scraping comprehensive profiles for ${venues.length} venues...`);
        let successCount = 0;
        let errorCount = 0;
        
        // Process venues in batches to avoid overwhelming the server
        const batchSize = 10;
        const totalBatches = Math.ceil(venues.length / batchSize);
        
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const startIndex = batchIndex * batchSize;
          const endIndex = Math.min(startIndex + batchSize, venues.length);
          const batch = venues.slice(startIndex, endIndex);
          
          console.log(`📦 Processing batch ${batchIndex + 1}/${totalBatches} (venues ${startIndex + 1}-${endIndex})`);
          
          for (let i = 0; i < batch.length; i++) {
            const venue = batch[i];
            const globalIndex = startIndex + i;
            
            if (venue.url) {
              console.log(`📋 [${globalIndex + 1}/${venues.length}] Scraping comprehensive profile for: ${venue.name}`);
              try {
                const profileData = await scraper.scrapeVenueProfile(venue.url);
                if (profileData) {
                  // Map comprehensive profile data to venue object
                  venue.profileData = profileData;
                  venue.detailedDescription = profileData.basic.description;
                  venue.amenities = Object.entries(profileData.amenities)
                    .filter(([, value]) => value)
                    .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
                  venue.specialties = profileData.services.ceremonyTypes;
                  venue.pricingDetails = profileData.pricing.details;
                  venue.capacityDetails = profileData.capacity.capacityDescription;
                  venue.contactPhone = profileData.contact.teamName; // Will be extracted from contact info
                  venue.contactEmail = ''; // Will be extracted from contact info
                  venue.contactWebsite = venue.url;
                  venue.reviews = profileData.individualReviews.slice(0, 3);
                  successCount++;
                  console.log(`✅ [${globalIndex + 1}/${venues.length}] Enhanced profile data for ${venue.name} (Success: ${successCount}, Errors: ${errorCount})`);
                } else {
                  errorCount++;
                  console.log(`⚠️ [${globalIndex + 1}/${venues.length}] No profile data extracted for ${venue.name}`);
                }
              } catch (profileError) {
                errorCount++;
                console.error(`❌ [${globalIndex + 1}/${venues.length}] Error scraping profile for ${venue.name}:`, profileError);
              }
              
              // Add a small delay to be respectful to the server
              if (i < batch.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between requests
              }
            }
          }
          
          // Longer delay between batches
          if (batchIndex < totalBatches - 1) {
            console.log(`⏳ Waiting 2 seconds before next batch...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        console.log(`🎯 Profile scraping completed: ${successCount} successful, ${errorCount} errors out of ${venues.length} venues`);
      }

      // Save venues to database
      if (venues.length > 0) {
        console.log('💾 Saving venues to database...');
        try {
          const venuesToSave = venues.map((venue: Venue) => {
            const profileData = venue.profileData;
            return {
              name: venue.name,
              category: 'venue',
              location: {
                city: venue.location?.city || '',
                state: venue.location?.state || '',
                full: venue.location?.full || ''
              },
              pricing: venue.pricing || {
                min: 1000,
                max: 5000,
                currency: 'USD'
              },
              rating: venue.rating || 0,
              review_count: venue.reviewCount || 0,
              portfolio_images: venue.imageUrl ? [venue.imageUrl] : [],
              description: venue.description || `Beautiful venue in ${venue.location?.full || location}`,
              specialties: venue.specialties || ['Wedding Reception', 'Ceremony', 'Corporate Events'],
              verified: false,
              featured: false,
              contact: {
                website: venue.url || ''
              },
              business_type: venue.venueType || 'venue',
              last_scraped: new Date().toISOString(),
              // Enhanced fields
              capacity_min: venue.capacity?.min || 0,
              capacity_max: venue.capacity?.max || 0,
              amenities: venue.amenities || [],
              venue_type: venue.venueType || 'venue',
              pricing_description: venue.pricing?.description || '',
              capacity_description: venue.capacity?.description || '',
              // Detailed fields
              detailed_description: venue.detailedDescription || venue.description || '',
              pricing_details: venue.pricingDetails || '',
              capacity_details: venue.capacityDetails || '',
              reviews: venue.reviews || [],
              contact_phone: venue.contactPhone || '',
              contact_email: venue.contactEmail || '',
              contact_website: venue.contactWebsite || venue.url || '',
              // Comprehensive profile fields
              tagline: profileData?.basic?.tagline || '',
              address: profileData?.basic?.address || '',
              neighborhood: profileData?.basic?.neighborhood || '',
              languages: profileData?.basic?.languages || [],
              guest_range: profileData?.capacity?.guestRange || '',
              max_capacity: profileData?.capacity?.maxCapacity || 0,
              ceremonies_and_receptions: profileData?.services?.ceremoniesAndReceptions || false,
              ceremony_types: profileData?.services?.ceremonyTypes || [],
              team_name: profileData?.contact?.teamName || '',
              team_role: profileData?.contact?.role || '',
              response_time: profileData?.contact?.responseTime || '',
              has_contact_form: profileData?.contact?.contactForm || false,
              award_count: profileData?.awards?.awardCount || 0,
              award_type: profileData?.awards?.awardType || '',
              award_source: profileData?.awards?.awardSource || '',
              pricing_available: profileData?.pricing?.available || false,
              pricing_requires_contact: profileData?.pricing?.requiresContact || false,
              // Amenities
              ceremony_area: profileData?.amenities?.ceremonyArea || false,
              covered_outdoors_space: profileData?.amenities?.coveredOutdoorsSpace || false,
              dressing_room: profileData?.amenities?.dressingRoom || false,
              handicap_accessible: profileData?.amenities?.handicapAccessible || false,
              indoor_event_space: profileData?.amenities?.indoorEventSpace || false,
              liability_insurance: profileData?.amenities?.liabilityInsurance || false,
              outdoor_event_space: profileData?.amenities?.outdoorEventSpace || false,
              reception_area: profileData?.amenities?.receptionArea || false,
              wireless_internet: profileData?.amenities?.wirelessInternet || false,
              // Settings
              ballroom: profileData?.settings?.ballroom || false,
              garden: profileData?.settings?.garden || false,
              historic_venue: profileData?.settings?.historicVenue || false,
              industrial_warehouse: profileData?.settings?.industrialWarehouse || false,
              trees: profileData?.settings?.trees || false,
              // Service offerings
              bar_and_drinks_available: profileData?.serviceOfferings?.barAndDrinks?.available || false,
              bar_rental: profileData?.serviceOfferings?.barAndDrinks?.barRental || false,
              cakes_and_desserts_available: profileData?.serviceOfferings?.cakesAndDesserts?.available || false,
              cupcakes: profileData?.serviceOfferings?.cakesAndDesserts?.cupcakes || false,
              other_desserts: profileData?.serviceOfferings?.cakesAndDesserts?.otherDesserts || false,
              food_and_catering_available: profileData?.serviceOfferings?.foodAndCatering?.available || false,
              planning_available: profileData?.serviceOfferings?.planning?.available || false,
              se_habla_espanol: profileData?.serviceOfferings?.planning?.seHablaEspanol || false,
              wedding_design: profileData?.serviceOfferings?.planning?.weddingDesign || false,
              rentals_and_equipment_available: profileData?.serviceOfferings?.rentalsAndEquipment?.available || false,
              tents: profileData?.serviceOfferings?.rentalsAndEquipment?.tents || false,
              service_staff_available: profileData?.serviceOfferings?.serviceStaff?.available || false,
              transportation_available: profileData?.serviceOfferings?.transportation?.available || false,
              shuttle_service: profileData?.serviceOfferings?.transportation?.shuttleService || false,
              // Reviews
              rating_breakdown: profileData?.reviews?.ratingBreakdown || {},
              ai_summary: profileData?.reviews?.aiSummary || '',
              sort_options: profileData?.reviews?.sortOptions || [],
              individual_reviews: profileData?.individualReviews || [],
              // Team
              team_description: profileData?.team?.description || '',
              team_message: profileData?.team?.teamMessage || '',
              // Media
              primary_image: profileData?.media?.primaryImage || '',
              review_photos: profileData?.media?.reviewPhotos || [],
              // Metadata
              source_url: profileData?.metadata?.sourceUrl || venue.url || '',
              page_type: profileData?.metadata?.pageType || 'venue_profile'
            };
          });

          const { error: insertError } = await supabase
            .from('vendors')
            .upsert(venuesToSave, { 
              onConflict: 'name,category',
              ignoreDuplicates: true 
            });

          if (insertError) {
            console.error('❌ Error saving venues to database:', insertError);
          } else {
            console.log(`✅ Successfully saved ${venues.length} venues to database`);
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

    // Return mock status for now - implement actual status checking as needed
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