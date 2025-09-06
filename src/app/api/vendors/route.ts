import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'venue';
    const location = searchParams.get('location') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query = supabase
      .from('vendors')
      .select('*')
      .eq('category', category)
      .order('rating', { ascending: false })
      .limit(limit);

    // Note: Location filtering is now handled in the UI for better performance
    // This allows us to fetch all venues and filter client-side by state/city

    const { data: vendors, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendors' },
        { status: 500 }
      );
    }

    let transformedVendors = vendors?.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
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
      businessType: vendor.business_type,
      // Enhanced profile fields
      tagline: vendor.tagline,
      address: vendor.address,
      neighborhood: vendor.neighborhood,
      guestRange: vendor.guest_range,
      maxCapacity: vendor.max_capacity,
      awardCount: vendor.award_count,
      awardType: vendor.award_type,
      ceremonyArea: vendor.ceremony_area,
      outdoorEventSpace: vendor.outdoor_event_space,
      handicapAccessible: vendor.handicap_accessible,
      ballroom: vendor.ballroom,
      garden: vendor.garden,
      historicVenue: vendor.historic_venue,
      pricingAvailable: vendor.pricing_available,
      hasContactForm: vendor.has_contact_form,
      responseTime: vendor.response_time
    })) || [];

    // If no vendors found in database and category is venue, try scraping
    if (transformedVendors.length === 0 && category === 'venue' && location) {
      console.log('No vendors in database, attempting to scrape...');
      try {
        const scraperResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scraping/venues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`
          },
          body: JSON.stringify({ location })
        });

        if (scraperResponse.ok) {
          const scraperData = await scraperResponse.json();
          console.log(`Scraper found ${scraperData.venuesFound} venues`);
          
          // Transform scraped venues to match the expected format
          transformedVendors = scraperData.sampleVenues?.map((venue: { name: string; location: string; rating: number; reviewCount: number }, index: number) => ({
            id: `scraped-${index}`,
            name: venue.name,
            category: 'venue',
            location: {
              city: '',
              state: '',
              full: venue.location || ''
            },
            pricing: {
              min: 1000,
              max: 5000,
              currency: 'USD'
            },
            rating: venue.rating || 0,
            reviewCount: venue.reviewCount || 0,
            portfolioImages: [],
            description: `Beautiful venue in ${venue.location || 'Minnesota'}`,
            specialties: ['Wedding Reception', 'Ceremony', 'Corporate Events'],
            verified: false,
            featured: false,
            contact: {},
            businessType: 'venue'
          })) || [];
        }
      } catch (scraperError) {
        console.error('Error calling scraper:', scraperError);
      }
    }

    return NextResponse.json({
      success: true,
      vendors: transformedVendors,
      total: transformedVendors.length,
      category,
      location
    });

  } catch (error) {
    console.error('Error in vendors API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all vendors

    if (error) {
      console.error('Error clearing vendors:', error);
      return NextResponse.json({ error: 'Failed to clear vendors' }, { status: 500 });
    }

    return NextResponse.json({ message: 'All vendors cleared successfully' });
  } catch (error) {
    console.error('Error in vendors DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
