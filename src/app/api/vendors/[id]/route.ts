import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // Get vendor from database
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Transform vendor data to match frontend interface with comprehensive profile data
    const transformedVendor = {
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      businessType: vendor.business_type,
      location: vendor.location,
      pricing: vendor.pricing,
      rating: vendor.rating,
      reviewCount: vendor.review_count,
      portfolioImages: vendor.portfolio_images || [],
      description: vendor.description,
      specialties: vendor.specialties || [],
      verified: vendor.verified,
      featured: vendor.featured,
      contact: vendor.contact,
      capacity: vendor.capacity_min && vendor.capacity_max ? {
        min: vendor.capacity_min,
        max: vendor.capacity_max,
        description: vendor.capacity_description || `${vendor.capacity_min}-${vendor.capacity_max} guests`
      } : undefined,
      venueType: vendor.venue_type,
      amenities: vendor.amenities || [],
      lastScraped: vendor.last_scraped,
      createdAt: vendor.created_at,
      // Detailed fields
      detailedDescription: vendor.detailed_description,
      pricingDetails: vendor.pricing_details,
      capacityDetails: vendor.capacity_details,
      reviews: vendor.reviews || [],
      contactPhone: vendor.contact_phone,
      contactEmail: vendor.contact_email,
      contactWebsite: vendor.contact_website,
      // Comprehensive profile fields
      tagline: vendor.tagline,
      address: vendor.address,
      neighborhood: vendor.neighborhood,
      languages: vendor.languages || [],
      guestRange: vendor.guest_range,
      maxCapacity: vendor.max_capacity,
      ceremoniesAndReceptions: vendor.ceremonies_and_receptions,
      ceremonyTypes: vendor.ceremony_types || [],
      teamName: vendor.team_name,
      teamRole: vendor.team_role,
      responseTime: vendor.response_time,
      hasContactForm: vendor.has_contact_form,
      awardCount: vendor.award_count,
      awardType: vendor.award_type,
      awardSource: vendor.award_source,
      pricingAvailable: vendor.pricing_available,
      pricingRequiresContact: vendor.pricing_requires_contact,
      // Amenities
      ceremonyArea: vendor.ceremony_area,
      coveredOutdoorsSpace: vendor.covered_outdoors_space,
      dressingRoom: vendor.dressing_room,
      handicapAccessible: vendor.handicap_accessible,
      indoorEventSpace: vendor.indoor_event_space,
      liabilityInsurance: vendor.liability_insurance,
      outdoorEventSpace: vendor.outdoor_event_space,
      receptionArea: vendor.reception_area,
      wirelessInternet: vendor.wireless_internet,
      // Settings
      ballroom: vendor.ballroom,
      garden: vendor.garden,
      historicVenue: vendor.historic_venue,
      industrialWarehouse: vendor.industrial_warehouse,
      trees: vendor.trees,
      // Service offerings
      barAndDrinksAvailable: vendor.bar_and_drinks_available,
      barRental: vendor.bar_rental,
      cakesAndDessertsAvailable: vendor.cakes_and_desserts_available,
      cupcakes: vendor.cupcakes,
      otherDesserts: vendor.other_desserts,
      foodAndCateringAvailable: vendor.food_and_catering_available,
      planningAvailable: vendor.planning_available,
      seHablaEspanol: vendor.se_habla_espanol,
      weddingDesign: vendor.wedding_design,
      rentalsAndEquipmentAvailable: vendor.rentals_and_equipment_available,
      tents: vendor.tents,
      serviceStaffAvailable: vendor.service_staff_available,
      transportationAvailable: vendor.transportation_available,
      shuttleService: vendor.shuttle_service,
      // Reviews
      ratingBreakdown: vendor.rating_breakdown || {},
      aiSummary: vendor.ai_summary,
      sortOptions: vendor.sort_options || [],
      individualReviews: vendor.individual_reviews || [],
      // Team
      teamDescription: vendor.team_description,
      teamMessage: vendor.team_message,
      // Media
      primaryImage: vendor.primary_image,
      reviewPhotos: vendor.review_photos || [],
      // Metadata
      sourceUrl: vendor.source_url,
      pageType: vendor.page_type
    };

    return NextResponse.json({
      success: true,
      vendor: transformedVendor
    });

  } catch (error) {
    console.error('Error in vendor detail API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
