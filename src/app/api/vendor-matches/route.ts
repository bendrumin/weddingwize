import { NextRequest, NextResponse } from 'next/server';
import { VendorMatcher, MatchingCriteria } from '@/lib/vendorMatching';
import { createClient } from '@supabase/supabase-js';
import { WeddingProfile, BudgetAllocation } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      category, 
      criteria = {},
      limit = 10 
    } = await request.json();

    if (!userId || !category) {
      return NextResponse.json(
        { error: 'User ID and category are required' },
        { status: 400 }
      );
    }

    // Get user profile and budget allocation
    const { data: profile, error: profileError } = await supabase
      .from('wedding_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const { data: budgetData, error: budgetError } = await supabase
      .from('budget_allocations')
      .select('*')
      .eq('user_id', userId);

    if (budgetError) {
      return NextResponse.json(
        { error: 'Failed to fetch budget data' },
        { status: 500 }
      );
    }

    // Convert budget allocations to simple object format
    const budgetAllocation: Record<string, number> = {
      venue: 0,
      catering: 0,
      photography: 0,
      flowers: 0,
      music: 0,
      attire: 0,
      transportation: 0,
      planning: 0,
      other: 0,
    };

    budgetData?.forEach(item => {
      if (item.category in budgetAllocation) {
        budgetAllocation[item.category] = item.allocated_amount;
      }
    });

    // Get vendors for the category
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .eq('category', category)
      .limit(100); // Limit for performance

    if (vendorsError) {
      return NextResponse.json(
        { error: 'Failed to fetch vendors' },
        { status: 500 }
      );
    }

    if (!vendors || vendors.length === 0) {
      return NextResponse.json({
        matches: [],
        count: 0,
        message: 'No vendors found for this category'
      });
    }

    // Create vendor matcher and find matches
    const matcher = new VendorMatcher(vendors);
    const matches = matcher.findMatches(
      profile as WeddingProfile,
      budgetAllocation as unknown as BudgetAllocation,
      category,
      criteria as MatchingCriteria
    ).slice(0, limit);

    // Store vendor matches for analytics
    const matchRecords = matches.map(match => ({
      user_id: userId,
      vendor_id: match.vendor.id,
      compatibility_score: match.compatibilityScore,
      match_reasons: match.matchReasons,
      user_action: 'viewed',
      created_at: new Date().toISOString()
    }));

    await supabase
      .from('vendor_matches')
      .upsert(matchRecords, { 
        onConflict: 'user_id,vendor_id',
        ignoreDuplicates: false 
      });

    return NextResponse.json({
      matches: matches.map(match => ({
        vendor: {
          id: match.vendor.id,
          name: match.vendor.name,
          category: match.vendor.category,
          location: match.vendor.location,
          pricing: match.vendor.pricing,
          contact: match.vendor.contact,
          portfolioImages: match.vendor.portfolioImages.slice(0, 5), // Limit images
          description: match.vendor.description,
          specialties: match.vendor.specialties,
          rating: match.vendor.rating,
          reviewCount: match.vendor.reviewCount,
          verified: match.vendor.verified,
          featured: match.vendor.featured
        },
        compatibilityScore: match.compatibilityScore,
        matchReasons: match.matchReasons,
        priceFit: match.priceFit,
        qualityScore: match.qualityScore,
        valueScore: match.valueScore,
        availabilityScore: match.availabilityScore
      })),
      count: matches.length,
      category,
      criteria
    });

  } catch (error) {
    console.error('Error finding vendor matches:', error);
    return NextResponse.json(
      { error: 'Failed to find vendor matches' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('vendor_matches')
      .select(`
        *,
        vendors (
          id,
          name,
          category,
          location,
          pricing,
          contact,
          portfolio_images,
          description,
          specialties,
          rating,
          review_count,
          verified,
          featured
        )
      `)
      .eq('user_id', userId)
      .order('compatibility_score', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('vendors.category', category);
    }

    const { data: matches, error } = await query;

    if (error) {
      console.error('Error fetching vendor matches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendor matches' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      matches: matches || [],
      count: matches?.length || 0
    });

  } catch (error) {
    console.error('Error fetching vendor matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor matches' },
      { status: 500 }
    );
  }
}
