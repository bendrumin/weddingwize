import { NextRequest, NextResponse } from 'next/server';
import { VendorScraper } from '@/lib/scraping/vendorScraper';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { location, category, maxPages = 3 } = await request.json();

    if (!location || !category) {
      return NextResponse.json(
        { error: 'Location and category are required' },
        { status: 400 }
      );
    }

    const scraper = new VendorScraper();

    await scraper.initialize();

    let vendors = [];
    
    try {
      if (category === 'venue') {
        vendors = await scraper.scrapeVenues(location, maxPages);
      } else {
        throw new Error(`Unsupported category: ${category}. Only 'venue' is currently supported.`);
      }

      // Store vendors in database (using insert for now to avoid constraint issues)
      const vendorData = vendors.map((vendor: any) => ({
        name: vendor.name,
        category: vendor.category,
        business_type: vendor.businessType,
        location: vendor.location,
        pricing: vendor.pricing,
        contact: vendor.contact,
        portfolio_images: vendor.portfolioImages,
        description: vendor.description,
        specialties: vendor.specialties,
        rating: vendor.rating,
        review_count: vendor.reviewCount,
        reviews_summary: vendor.reviewsSummary,
        last_scraped: vendor.lastScraped.toISOString(),
        verified: vendor.verified,
        featured: vendor.featured
      }));

      // Try to insert vendors, ignoring duplicates
      const { data, error } = await supabase
        .from('vendors')
        .upsert(vendorData, { 
          onConflict: 'name,category',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Error storing vendors:', error);
        return NextResponse.json(
          { error: 'Failed to store vendor data' },
          { status: 500 }
        );
      }

      // Log scraping job
      await supabase
        .from('scraping_jobs')
        .insert({
          job_type: category,
          target_location: { city: location },
          status: 'completed',
          vendors_found: vendors.length,
          vendors_updated: data?.length || 0,
          completed_at: new Date().toISOString()
        });

      return NextResponse.json({
        success: true,
        vendorsFound: vendors.length,
        vendorsStored: data?.length || 0,
        location,
        category
      });

    } finally {
      await scraper.close();
    }

  } catch (error) {
    console.error('Error scraping vendors:', error);
    
    // Log failed scraping job
    try {
      await supabase
        .from('scraping_jobs')
        .insert({
          job_type: 'unknown',
          target_location: {},
          status: 'failed',
          vendors_found: 0,
          vendors_updated: 0,
          errors_encountered: [error instanceof Error ? error.message : 'Unknown error'],
          completed_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Error logging failed job:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to scrape vendors' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('vendors')
      .select('*')
      .limit(limit);

    if (location) {
      query = query.eq('location->city', location);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: vendors, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendors' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      vendors: vendors || [],
      count: vendors?.length || 0
    });

  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}
