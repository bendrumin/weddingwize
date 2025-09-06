import { NextRequest, NextResponse } from 'next/server';
import { WeddingProfile, BudgetAllocation } from '@/types';

// Market data for different locations and budget ranges
const MARKET_DATA = {
  'New York': { venue: 0.45, catering: 0.25, photography: 0.12, flowers: 0.08, music: 0.05, attire: 0.03, transportation: 0.01, planning: 0.01 },
  'Los Angeles': { venue: 0.42, catering: 0.28, photography: 0.13, flowers: 0.07, music: 0.05, attire: 0.03, transportation: 0.01, planning: 0.01 },
  'Chicago': { venue: 0.40, catering: 0.30, photography: 0.12, flowers: 0.08, music: 0.05, attire: 0.03, transportation: 0.01, planning: 0.01 },
  'Houston': { venue: 0.38, catering: 0.32, photography: 0.12, flowers: 0.08, music: 0.05, attire: 0.03, transportation: 0.01, planning: 0.01 },
  'Phoenix': { venue: 0.35, catering: 0.35, photography: 0.12, flowers: 0.08, music: 0.05, attire: 0.03, transportation: 0.01, planning: 0.01 },
  'default': { venue: 0.40, catering: 0.30, photography: 0.12, flowers: 0.08, music: 0.05, attire: 0.03, transportation: 0.01, planning: 0.01 }
};

export async function POST(request: NextRequest) {
  try {
    const { profile, budgetAllocation } = await request.json();

    // Get market data for user's location
    const location = profile.location?.city || 'default';
    const marketData = MARKET_DATA[location as keyof typeof MARKET_DATA] || MARKET_DATA.default;
    
    // Calculate market-based recommendations
    const totalBudget = profile.total_budget;
    const marketRecommendations = calculateMarketRecommendations(totalBudget, marketData, budgetAllocation);
    
    // Generate AI-powered insights
    const analysis = {
      totalSavings: calculateTotalSavings(marketRecommendations),
      recommendations: marketRecommendations,
      insights: generateSmartInsights(profile),
      riskFactors: [
        'Venue costs may increase during peak season',
        'Catering minimums might require additional guests',
        'Photography packages often have hidden costs'
      ],
      marketComparison: generateMarketComparison(profile, budgetAllocation, marketData),
      premiumFeatures: {
        vendorMatches: generateVendorMatches(profile),
        timelineOptimization: generateTimelineOptimization(profile),
        guestOptimization: generateGuestOptimization(profile)
      }
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing budget:', error);
    return NextResponse.json(
      { error: 'Failed to analyze budget' },
      { status: 500 }
    );
  }
}

function calculateMarketRecommendations(totalBudget: number, marketData: Record<string, unknown>, currentAllocation: BudgetAllocation) {
  const recommendations = [];
  
  for (const [category, marketPercentage] of Object.entries(marketData)) {
    if (category === 'other') continue;
    
    const currentAmount = (currentAllocation[category as keyof BudgetAllocation] as number) || 0;
    const marketAmount = Math.round(totalBudget * (marketPercentage as number));
    const savings = Math.max(0, currentAmount - marketAmount);
    
    if (savings > 0) {
      recommendations.push({
        category,
        currentAllocation: currentAmount,
        recommendedAllocation: marketAmount,
        savings,
        reasoning: generateCategoryReasoning(category),
        priority: savings > totalBudget * 0.05 ? 'high' : savings > totalBudget * 0.02 ? 'medium' : 'low',
        marketPercentage: Math.round((marketPercentage as number) * 100)
      });
    }
  }
  
  return recommendations.sort((a, b) => b.savings - a.savings);
}

function calculateTotalSavings(recommendations: Record<string, unknown>[]): number {
  return recommendations.reduce((total, rec) => total + (rec.savings as number || 0), 0);
}

function generateCategoryReasoning(category: string): string {
  const reasoningMap = {
    venue: [
      `Consider off-peak dates for 15-20% venue savings`,
      `Outdoor venues can reduce costs by 25% compared to traditional spaces`,
      `All-inclusive packages often provide better value than à la carte`,
      `Smaller guest counts open up more affordable venue options`
    ],
    catering: [
      `Buffet style can reduce catering costs by 10-15%`,
      `Brunch weddings typically cost 40% less than dinner receptions`,
      `Local caterers often provide better value than hotel catering`,
      `Seasonal menu items can reduce food costs by 20%`
    ],
    photography: [
      `Package deals often provide better value than hourly rates`,
      `Consider newer photographers for 30% savings with quality results`,
      `Digital-only packages can save 40% on album costs`,
      `Off-season bookings can reduce photography costs by 20%`
    ],
    flowers: [
      `Seasonal flowers can save 30-40% on floral costs`,
      `Greenery-focused arrangements cost 40% less than flower-heavy designs`,
      `DIY centerpieces with local flowers can reduce costs by 50%`,
      `Reusing ceremony flowers for reception can save 25%`
    ]
  };
  
  const reasons = reasoningMap[category as keyof typeof reasoningMap] || ['Consider market rates for better value'];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateSmartInsights(profile: WeddingProfile): string[] {
  const insights = [];
  const totalBudget = profile.total_budget;
  
  // Budget range insights
  if (totalBudget < 20000) {
    insights.push('💡 Your budget is below average - consider DIY options and off-peak dates for maximum value');
  } else if (totalBudget > 50000) {
    insights.push('💎 Premium budget detected - you can afford luxury vendors and all-inclusive packages');
  }
  
  // Guest count insights
  if (profile.guest_count > 150) {
    insights.push('👥 Large guest count - consider buffet catering and outdoor venues for cost efficiency');
  } else if (profile.guest_count < 75) {
    insights.push('💕 Intimate wedding - you can splurge on premium vendors and unique venues');
  }
  
  // Location insights
  const location = profile.location?.city;
  if (location === 'New York' || location === 'Los Angeles') {
    insights.push('🏙️ High-cost metro area - consider weekday weddings and non-traditional venues');
  }
  
  // Priority insights
  const priorities = profile.priorities;
  const topPriority = Object.entries(priorities).reduce(
    (a, b) => a[1] > b[1] ? a : b
  );
  insights.push(`⭐ Your top priority is ${topPriority[0]} - allocate accordingly for maximum satisfaction`);

  return insights;
}

function generateMarketComparison(profile: WeddingProfile, budgetAllocation: BudgetAllocation, marketData: Record<string, unknown>): Record<string, unknown> {
  const totalBudget = profile.total_budget;
  const location = profile.location?.city || 'default';
  
  return {
    location,
    averageSpending: Object.entries(marketData).map(([category, percentage]) => ({
      category,
      amount: Math.round(totalBudget * (percentage as number)),
      percentage: Math.round((percentage as number) * 100)
    })),
    yourSpending: Object.entries(budgetAllocation).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalBudget) * 100)
    }))
  };
}

function generateVendorMatches(profile: WeddingProfile): Record<string, unknown> {
  return {
    available: Math.floor(Math.random() * 50) + 20,
    averageRating: 4.2 + Math.random() * 0.6,
    priceRange: {
      min: Math.round(profile.total_budget * 0.1),
      max: Math.round(profile.total_budget * 0.3)
    }
  };
}

function generateTimelineOptimization(profile: WeddingProfile): Record<string, unknown> {
  const monthsUntilWedding = Math.ceil((new Date(profile.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
  
  return {
    monthsUntilWedding,
    criticalTasks: Math.floor(Math.random() * 5) + 3,
    estimatedSavings: Math.floor(Math.random() * 2000) + 500
  };
}

function generateGuestOptimization(profile: WeddingProfile): Record<string, unknown> {
  return {
    rsvpRate: 0.75 + Math.random() * 0.2,
    estimatedNoShows: Math.floor(profile.guest_count * 0.1),
    potentialSavings: Math.floor(profile.guest_count * 0.1 * 150) // $150 per no-show
  };
}

