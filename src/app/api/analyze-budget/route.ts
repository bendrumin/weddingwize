import { NextRequest, NextResponse } from 'next/server';
import { WeddingProfile, BudgetAllocation } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { profile, budgetAllocation } = await request.json();

    // In production, this would call OpenAI API
    // For now, we'll return mock data based on the profile
    
    const mockAnalysis = {
      totalSavings: Math.floor(Math.random() * 5000) + 2000, // $2,000 - $7,000
      recommendations: [
        {
          category: 'venue',
          currentAllocation: budgetAllocation.venue,
          recommendedAllocation: Math.round(budgetAllocation.venue * (0.8 + Math.random() * 0.15)),
          savings: Math.round(budgetAllocation.venue * (0.05 + Math.random() * 0.15)),
          reasoning: generateVenueReasoning(profile),
          priority: 'high' as const
        },
        {
          category: 'catering',
          currentAllocation: budgetAllocation.catering,
          recommendedAllocation: Math.round(budgetAllocation.catering * (0.85 + Math.random() * 0.1)),
          savings: Math.round(budgetAllocation.catering * (0.05 + Math.random() * 0.1)),
          reasoning: generateCateringReasoning(profile),
          priority: 'medium' as const
        },
        {
          category: 'flowers',
          currentAllocation: budgetAllocation.flowers,
          recommendedAllocation: Math.round(budgetAllocation.flowers * (0.6 + Math.random() * 0.2)),
          savings: Math.round(budgetAllocation.flowers * (0.2 + Math.random() * 0.2)),
          reasoning: generateFlowerReasoning(profile),
          priority: 'high' as const
        }
      ],
      insights: generateInsights(profile, budgetAllocation),
      riskFactors: generateRiskFactors(profile, budgetAllocation)
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Error analyzing budget:', error);
    return NextResponse.json(
      { error: 'Failed to analyze budget' },
      { status: 500 }
    );
  }
}

function generateVenueReasoning(profile: WeddingProfile): string {
  const reasons = [
    'Consider off-peak dates or weekday weddings for 15% venue savings',
    'Outdoor venues can reduce costs by 20% compared to traditional indoor spaces',
    'All-inclusive packages often provide better value than à la carte options',
    'Smaller guest counts can open up more affordable venue options',
    'Non-traditional venues (museums, parks, breweries) often cost 30% less'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateCateringReasoning(profile: WeddingProfile): string {
  const reasons = [
    'Buffet style can reduce catering costs by 10% while maintaining quality',
    'Brunch weddings typically cost 40% less than dinner receptions',
    'Local caterers often provide better value than hotel catering',
    'Family-style service can reduce labor costs by 15%',
    'Seasonal menu items can reduce food costs by 20%'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateFlowerReasoning(profile: WeddingProfile): string {
  const reasons = [
    'Seasonal flowers can save 30% on floral costs',
    'DIY centerpieces with local flowers can reduce costs by 50%',
    'Greenery-focused arrangements cost 40% less than flower-heavy designs',
    'Reusing ceremony flowers for reception can save 25%',
    'Local flower farms often provide better prices than florists'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateInsights(profile: WeddingProfile, budgetAllocation: BudgetAllocation): string[] {
  const insights = [
    `Your venue allocation is ${Math.floor(Math.random() * 20) + 5}% above average for your budget range`,
    'Flower costs can be reduced significantly with seasonal choices',
    'Consider a brunch wedding to save on catering and venue costs',
    'Your photography priority aligns well with your budget allocation',
    'Weekday weddings can save 20-30% on overall costs',
    'Local vendors often provide better value than destination options',
    'DIY elements can reduce costs by 15-25% in multiple categories'
  ];
  
  return insights.slice(0, 4); // Return 4 random insights
}

function generateRiskFactors(profile: WeddingProfile, budgetAllocation: BudgetAllocation): string[] {
  const risks = [
    'Venue costs may increase during peak season',
    'Catering minimums might require additional guests',
    'Photography packages often have hidden costs',
    'Weather-dependent outdoor venues may need backup plans',
    'Vendor availability may be limited during peak months',
    'Last-minute changes can increase costs significantly'
  ];
  
  return risks.slice(0, 3); // Return 3 random risk factors
}
