import { NextRequest, NextResponse } from 'next/server';
import { VendorScraper } from '@/lib/scraping/vendorScraper';
import { createClient } from '@supabase/supabase-js';

interface Venue {
  name: string;
  location?: {
    city?: string;
    state?: string;
    full?: string;
  };
  rating?: number;
  reviewCount?: number;
  url?: string;
  imageUrl?: string;
  source?: string;
  pricing?: {
    min?: number;
    max?: number;
    currency?: string;
    description?: string;
  };
  description?: string;
  venueType?: string;
  amenities?: string[];
  specialties?: string[];
  capacity?: {
    min?: number;
    max?: number;
    description?: string;
  };
  detailedDescription?: string;
  pricingDetails?: string;
  capacityDetails?: string;
  reviews?: Array<{
    rating?: number;
    comment?: string;
    author?: string;
    date?: string;
  }>;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized (cron job or admin)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting comprehensive venue scraping...');
    
    // Get batch parameters
    const body = await request.json().catch(() => ({}));
    const startIndex = body.startIndex || parseInt(process.env.STATE_START_INDEX || '0');
    const maxStates = body.maxStates || 10;
    
    console.log(`📊 Processing batch: states ${startIndex + 1}-${startIndex + maxStates}`);
    
    // Initialize scraper
    const scraper = new VendorScraper();
    await scraper.initialize();
    
    try {
      // Set environment variables for batch processing
      process.env.STATE_START_INDEX = startIndex.toString();
      
      // Run comprehensive scraping
      const venues = await scraper.scrapeAllVenues(); // Comprehensive scraping
      
      console.log(`✅ Scraped ${venues.length} venues from batch`);
      
      // Deduplicate venues by name and location to avoid database conflicts
      const uniqueVenues = venues.length > 0 ? venues.reduce((acc: Venue[], venue) => {
        const key = `${venue.name.toLowerCase()}-${venue.location?.full?.toLowerCase() || 'unknown'}`;
        if (!acc.find(v => `${v.name.toLowerCase()}-${v.location?.full?.toLowerCase() || 'unknown'}` === key)) {
          acc.push(venue);
        }
        return acc;
      }, []) : [];
      
      console.log(`🔄 Deduplicated ${venues.length} venues to ${uniqueVenues.length} unique venues`);
      
      if (uniqueVenues.length > 0) {
        console.log('💾 Attempting to save venues to database...');
        
        // Save venues to database (matching existing schema)
        const venueData = uniqueVenues.map(venue => ({
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
          description: venue.description || `Beautiful venue in ${venue.location?.full || 'Unknown'}`,
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
          availability_calendar: {},
          reviews_summary: {},
          lead_fee_percentage: 0
        }));
        
        const { error } = await supabase
          .from('vendors')
          .upsert(
            venueData,
            { 
              onConflict: 'name,category',
              ignoreDuplicates: false 
            }
          );
        
        if (error) {
          console.error('❌ Database error:', error);
          return NextResponse.json({ 
            error: 'Database error', 
            details: error.message 
          }, { status: 500 });
        }
        
        console.log(`💾 Successfully saved ${uniqueVenues.length} venues to database`);
        
        // Verify the venues were actually saved
        const { count: newCount, error: countError } = await supabase
          .from('vendors')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'venue');
          
        if (countError) {
          console.error('❌ Error getting venue count:', countError);
        } else {
          console.log(`📊 Total venues in database after save: ${newCount}`);
        }
      }
      
      // Calculate next batch
      const nextStartIndex = startIndex + maxStates;
      const totalStates = 50;
      const isComplete = nextStartIndex >= totalStates;
      
      return NextResponse.json({
        success: true,
        message: `Batch completed successfully`,
        venuesScraped: uniqueVenues.length,
        batchInfo: {
          currentBatch: `${startIndex + 1}-${Math.min(startIndex + maxStates, totalStates)}`,
          nextStartIndex: isComplete ? null : nextStartIndex,
          isComplete,
          totalStates
        },
        summary: {
          statesProcessed: Math.min(maxStates, totalStates - startIndex),
          venuesPerState: Math.round(uniqueVenues.length / Math.min(maxStates, totalStates - startIndex)),
          totalVenues: uniqueVenues.length
        }
      });
      
    } finally {
      await scraper.close();
    }
    
  } catch (error) {
    console.error('❌ Comprehensive scraping error:', error);
    return NextResponse.json({ 
      error: 'Scraping failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check scraping status
export async function GET() {
  try {
    // Get venue count by state
    const { data: venues, error } = await supabase
      .from('vendors')
      .select('location')
      .eq('category', 'venue');
    
    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    // Count venues by state
    const stateCounts = venues.reduce((acc: Record<string, number>, venue) => {
      const state = venue.location?.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    
    const totalVenues = venues.length;
    const statesWithVenues = Object.keys(stateCounts).length;
    
    return NextResponse.json({
      status: 'success',
      summary: {
        totalVenues,
        statesWithVenues,
        totalStates: 50,
        completionPercentage: Math.round((statesWithVenues / 50) * 100)
      },
      stateCounts,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json({ 
      error: 'Status check failed' 
    }, { status: 500 });
  }
}
