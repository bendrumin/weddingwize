// app/api/scraping/venue-profiles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VenueProfileScraper } from '@/lib/scraping/venueProfileScraper';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('🚀 API POST /api/scraping/venue-profiles called');
  
  const timestamp = new Date().toISOString();
  let scraper: VenueProfileScraper | null = null;
  
  try {
    // Verify cron secret
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { venueIds, maxVenues } = body;

    console.log(`🔍 Starting venue profile scraping...`);

    // Get venues from database that need profile data
    let query = supabase
      .from('vendors')
      .select('id, name, url, source_url')
      .eq('category', 'venue')
      .is('tagline', null) // Only get venues without comprehensive profile data
      .limit(maxVenues || 10);

    if (venueIds && venueIds.length > 0) {
      query = query.in('id', venueIds);
    }

    const { data: venues, error: fetchError } = await query;

    if (fetchError) {
      console.error('❌ Error fetching venues:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
    }

    if (!venues || venues.length === 0) {
      console.log('ℹ️ No venues found that need profile data');
      return NextResponse.json({ 
        success: true,
        message: 'No venues found that need profile data',
        venuesProcessed: 0
      });
    }

    console.log(`📊 Found ${venues.length} venues that need profile data`);

    // Initialize the profile scraper
    try {
      scraper = new VenueProfileScraper();
      await scraper.initialize();
    } catch (scraperError) {
      console.error('❌ Failed to initialize profile scraper:', scraperError);
      return NextResponse.json({ 
        error: 'Failed to initialize profile scraper',
        details: scraperError instanceof Error ? scraperError.message : String(scraperError)
      }, { status: 500 });
    }

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process venues one by one
    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];
      const venueUrl = venue.source_url || venue.url;
      
      if (!venueUrl) {
        console.log(`⚠️ [${i + 1}/${venues.length}] No URL for venue: ${venue.name}`);
        errorCount++;
        continue;
      }

      console.log(`📋 [${i + 1}/${venues.length}] Scraping profile for: ${venue.name}`);
      
      try {
        const profileData = await scraper.scrapeVenueProfile(venueUrl);
        
        if (profileData) {
          // Update the venue in the database with profile data
          const updateData = {
            // Basic information
            tagline: profileData.basic.tagline,
            address: profileData.basic.address,
            neighborhood: profileData.basic.neighborhood,
            languages: profileData.basic.languages,
            
            // Capacity
            guest_range: profileData.capacity.guestRange,
            max_capacity: profileData.capacity.maxCapacity,
            
            // Services
            ceremonies_and_receptions: profileData.services.ceremoniesAndReceptions,
            ceremony_types: profileData.services.ceremonyTypes,
            
            // Contact
            team_name: profileData.contact.teamName,
            team_role: profileData.contact.role,
            response_time: profileData.contact.responseTime,
            has_contact_form: profileData.contact.contactForm,
            
            // Awards
            award_count: profileData.awards.awardCount,
            award_type: profileData.awards.awardType,
            award_source: profileData.awards.awardSource,
            
            // Pricing
            pricing_available: profileData.pricing.available,
            pricing_requires_contact: profileData.pricing.requiresContact,
            
            // Amenities
            ceremony_area: profileData.amenities.ceremonyArea,
            covered_outdoors_space: profileData.amenities.coveredOutdoorsSpace,
            dressing_room: profileData.amenities.dressingRoom,
            handicap_accessible: profileData.amenities.handicapAccessible,
            indoor_event_space: profileData.amenities.indoorEventSpace,
            liability_insurance: profileData.amenities.liabilityInsurance,
            outdoor_event_space: profileData.amenities.outdoorEventSpace,
            reception_area: profileData.amenities.receptionArea,
            wireless_internet: profileData.amenities.wirelessInternet,
            
            // Settings
            ballroom: profileData.settings.ballroom,
            garden: profileData.settings.garden,
            historic_venue: profileData.settings.historicVenue,
            industrial_warehouse: profileData.settings.industrialWarehouse,
            trees: profileData.settings.trees,
            
            // Service offerings
            bar_and_drinks_available: profileData.serviceOfferings.barAndDrinks.available,
            bar_rental: profileData.serviceOfferings.barAndDrinks.barRental,
            cakes_and_desserts_available: profileData.serviceOfferings.cakesAndDesserts.available,
            cupcakes: profileData.serviceOfferings.cakesAndDesserts.cupcakes,
            other_desserts: profileData.serviceOfferings.cakesAndDesserts.otherDesserts,
            food_and_catering_available: profileData.serviceOfferings.foodAndCatering.available,
            planning_available: profileData.serviceOfferings.planning.available,
            se_habla_espanol: profileData.serviceOfferings.planning.seHablaEspanol,
            wedding_design: profileData.serviceOfferings.planning.weddingDesign,
            rentals_and_equipment_available: profileData.serviceOfferings.rentalsAndEquipment.available,
            tents: profileData.serviceOfferings.rentalsAndEquipment.tents,
            service_staff_available: profileData.serviceOfferings.serviceStaff.available,
            transportation_available: profileData.serviceOfferings.transportation.available,
            shuttle_service: profileData.serviceOfferings.transportation.shuttleService,
            
            // Reviews
            rating_breakdown: profileData.reviews.ratingBreakdown,
            ai_summary: profileData.reviews.aiSummary,
            sort_options: profileData.reviews.sortOptions,
            individual_reviews: profileData.individualReviews,
            
            // Team
            team_description: profileData.team.description,
            team_message: profileData.team.teamMessage,
            
            // Media
            primary_image: profileData.media.primaryImage,
            review_photos: profileData.media.reviewPhotos,
            
            // Metadata
            source_url: profileData.metadata.sourceUrl,
            page_type: profileData.metadata.pageType,
            
            // Update timestamp
            last_scraped: new Date().toISOString()
          };

          const { error: updateError } = await supabase
            .from('vendors')
            .update(updateData)
            .eq('id', venue.id);

          if (updateError) {
            console.error(`❌ [${i + 1}/${venues.length}] Error updating venue ${venue.name}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ [${i + 1}/${venues.length}] Successfully updated profile for ${venue.name}`);
            successCount++;
            results.push({
              id: venue.id,
              name: venue.name,
              success: true,
              profileData: {
                hasBasicInfo: !!profileData.basic.name,
                hasCapacity: !!profileData.capacity.guestRange,
                amenityCount: Object.values(profileData.amenities).filter(Boolean).length,
                settingCount: Object.values(profileData.settings).filter(Boolean).length,
                reviewCount: profileData.individualReviews.length,
                hasContact: !!profileData.contact.teamName,
                hasAwards: profileData.awards.awardCount > 0,
                hasPricing: profileData.pricing.available
              }
            });
          }
        } else {
          console.log(`⚠️ [${i + 1}/${venues.length}] No profile data extracted for ${venue.name}`);
          errorCount++;
          results.push({
            id: venue.id,
            name: venue.name,
            success: false,
            error: 'No profile data extracted'
          });
        }
      } catch (profileError) {
        console.error(`❌ [${i + 1}/${venues.length}] Error scraping profile for ${venue.name}:`, profileError);
        errorCount++;
        results.push({
          id: venue.id,
          name: venue.name,
          success: false,
          error: profileError instanceof Error ? profileError.message : String(profileError)
        });
      }

      // Add delay between requests to be respectful
      if (i < venues.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    }

    console.log(`🎯 Profile scraping completed: ${successCount} successful, ${errorCount} errors out of ${venues.length} venues`);

    return NextResponse.json({
      success: true,
      message: `Profile scraping completed: ${successCount} successful, ${errorCount} errors`,
      venuesProcessed: venues.length,
      successCount,
      errorCount,
      results,
      timestamp
    });

  } catch (error: unknown) {
    console.error('Profile scraper error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Profile scraping failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp
    }, { status: 500 });
  } finally {
    // Clean up resources
    if (scraper) {
      try {
        await scraper.close();
      } catch (closeError) {
        console.error('Error closing profile scraper:', closeError);
      }
    }
  }
}

// GET endpoint for status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');

    if (test === 'true') {
      return NextResponse.json({
        status: 'healthy',
        message: 'Venue profile scraping service is operational',
        timestamp: new Date().toISOString()
      });
    }

    // Get count of venues that need profile data
    const { count, error } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'venue')
      .is('tagline', null);

    if (error) {
      console.error('Error getting venue count:', error);
      return NextResponse.json({ 
        error: 'Failed to get venue count' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 'ready',
      venuesNeedingProfiles: count || 0,
      message: `Ready to scrape profiles for ${count || 0} venues`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in GET endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
