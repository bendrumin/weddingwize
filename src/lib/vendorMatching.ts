import { WeddingProfile, BudgetAllocation } from '@/types';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  businessType: string;
  location: {
    city: string;
    state: string;
    zipcode: string;
    coordinates?: { lat: number; lng: number };
  };
  pricing: {
    min: number;
    max: number;
    currency: string;
    perUnit: string;
    notes?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    social?: string[];
  };
  portfolioImages: string[];
  description: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  reviewsSummary: {
    positive: number;
    negative: number;
    commonThemes: string[];
  };
  lastScraped: string;
  verified: boolean;
  featured: boolean;
}

export interface VendorMatch {
  vendor: Vendor;
  compatibilityScore: number;
  matchReasons: string[];
  priceFit: 'under_budget' | 'within_budget' | 'over_budget';
  distanceFromVenue?: number;
  availabilityScore: number;
  qualityScore: number;
  valueScore: number;
}

export interface MatchingCriteria {
  maxDistance?: number; // miles
  minRating?: number;
  maxPrice?: number;
  minReviewCount?: number;
  preferredSpecialties?: string[];
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
}

export class VendorMatcher {
  private vendors: Vendor[] = [];

  constructor(vendors: Vendor[]) {
    this.vendors = vendors;
  }

  findMatches(
    profile: WeddingProfile,
    budgetAllocation: BudgetAllocation,
    category: string,
    criteria: MatchingCriteria = {}
  ): VendorMatch[] {
    const categoryVendors = this.vendors.filter(v => v.category === category);
    const matches: VendorMatch[] = [];

    for (const vendor of categoryVendors) {
      const match = this.calculateMatch(vendor, profile, budgetAllocation, criteria);
      if (match.compatibilityScore > 0.3) { // Only include decent matches
        matches.push(match);
      }
    }

    // Sort by compatibility score (highest first)
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  private calculateMatch(
    vendor: Vendor,
    profile: WeddingProfile,
    budgetAllocation: BudgetAllocation,
    criteria: MatchingCriteria
  ): VendorMatch {
    const reasons: string[] = [];
    let compatibilityScore = 0;

    // Price fit calculation
    const budgetForCategory = budgetAllocation[vendor.category as keyof BudgetAllocation] || 0;
    const priceFit = this.calculatePriceFit(vendor.pricing, budgetForCategory);
    
    // Quality score (rating + review count)
    const qualityScore = this.calculateQualityScore(vendor);
    
    // Value score (quality vs price)
    const valueScore = this.calculateValueScore(vendor, budgetForCategory);
    
    // Availability score (based on last scraped date and other factors)
    const availabilityScore = this.calculateAvailabilityScore(vendor);
    
    // Distance score (if coordinates available)
    const distanceScore = this.calculateDistanceScore(vendor, profile);

    // Apply criteria filters
    if (criteria.minRating && vendor.rating < criteria.minRating) {
      return this.createEmptyMatch(vendor);
    }

    if (criteria.minReviewCount && vendor.reviewCount < criteria.minReviewCount) {
      return this.createEmptyMatch(vendor);
    }

    if (criteria.verifiedOnly && !vendor.verified) {
      return this.createEmptyMatch(vendor);
    }

    if (criteria.featuredOnly && !vendor.featured) {
      return this.createEmptyMatch(vendor);
    }

    // Calculate overall compatibility score
    compatibilityScore = (
      priceFit.score * 0.3 +
      qualityScore * 0.25 +
      valueScore * 0.2 +
      availabilityScore * 0.15 +
      distanceScore * 0.1
    );

    // Add match reasons
    if (priceFit.score > 0.8) {
      reasons.push('Great price fit for your budget');
    }
    if (qualityScore > 0.8) {
      reasons.push('Highly rated with many reviews');
    }
    if (valueScore > 0.8) {
      reasons.push('Excellent value for money');
    }
    if (vendor.verified) {
      reasons.push('Verified vendor');
    }
    if (vendor.featured) {
      reasons.push('Featured vendor');
    }
    if (vendor.specialties.some(s => profile.wedding_style?.includes(s))) {
      reasons.push('Matches your wedding style');
    }

    return {
      vendor,
      compatibilityScore,
      matchReasons: reasons,
      priceFit: priceFit.category,
      availabilityScore,
      qualityScore,
      valueScore
    };
  }

  private calculatePriceFit(pricing: Vendor['pricing'], budget: number): { score: number; category: 'under_budget' | 'within_budget' | 'over_budget' } {
    if (budget === 0) return { score: 0.5, category: 'within_budget' };

    const avgPrice = (pricing.min + pricing.max) / 2;
    const budgetRatio = avgPrice / budget;

    if (budgetRatio <= 0.8) {
      return { score: 0.9, category: 'under_budget' };
    } else if (budgetRatio <= 1.2) {
      return { score: 1.0, category: 'within_budget' };
    } else if (budgetRatio <= 1.5) {
      return { score: 0.6, category: 'over_budget' };
    } else {
      return { score: 0.2, category: 'over_budget' };
    }
  }

  private calculateQualityScore(vendor: Vendor): number {
    // Combine rating and review count for quality score
    const ratingScore = vendor.rating / 5; // Normalize to 0-1
    const reviewScore = Math.min(vendor.reviewCount / 100, 1); // Cap at 100 reviews
    
    return (ratingScore * 0.7 + reviewScore * 0.3);
  }

  private calculateValueScore(vendor: Vendor, budget: number): number {
    if (budget === 0) return 0.5;

    const avgPrice = (vendor.pricing.min + vendor.pricing.max) / 2;
    const qualityScore = this.calculateQualityScore(vendor);
    
    // Higher quality for lower price = better value
    const valueRatio = qualityScore / (avgPrice / budget);
    
    return Math.min(valueRatio, 1);
  }

  private calculateAvailabilityScore(vendor: Vendor): number {
    // Check how recently the vendor was scraped
    const lastScraped = new Date(vendor.lastScraped);
    const daysSinceScraped = (Date.now() - lastScraped.getTime()) / (1000 * 60 * 60 * 24);
    
    // More recent = higher availability score
    if (daysSinceScraped < 7) return 1.0;
    if (daysSinceScraped < 30) return 0.8;
    if (daysSinceScraped < 90) return 0.6;
    return 0.4;
  }

  private calculateDistanceScore(vendor: Vendor, profile: WeddingProfile): number {
    // If no coordinates, return neutral score
    if (!vendor.location.coordinates || !profile.location?.coordinates) {
      return 0.5;
    }

    const distance = this.calculateDistance(
      profile.location.coordinates,
      vendor.location.coordinates
    );

    // Prefer vendors within 25 miles
    if (distance <= 25) return 1.0;
    if (distance <= 50) return 0.8;
    if (distance <= 100) return 0.6;
    return 0.3;
  }

  private calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private createEmptyMatch(vendor: Vendor): VendorMatch {
    return {
      vendor,
      compatibilityScore: 0,
      matchReasons: [],
      priceFit: 'over_budget',
      availabilityScore: 0,
      qualityScore: 0,
      valueScore: 0
    };
  }

  // Find similar couples for recommendations
  findSimilarCouples(profile: WeddingProfile, allProfiles: WeddingProfile[]): WeddingProfile[] {
    const similar: { profile: WeddingProfile; similarity: number }[] = [];

    for (const otherProfile of allProfiles) {
      if (otherProfile.id === profile.id) continue;

      const similarity = this.calculateProfileSimilarity(profile, otherProfile);
      if (similarity > 0.6) {
        similar.push({ profile: otherProfile, similarity });
      }
    }

    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(s => s.profile);
  }

  private calculateProfileSimilarity(profile1: WeddingProfile, profile2: WeddingProfile): number {
    let similarity = 0;
    let factors = 0;

    // Budget similarity (within 20%)
    const budgetDiff = Math.abs(profile1.total_budget - profile2.total_budget);
    const budgetSimilarity = 1 - (budgetDiff / Math.max(profile1.total_budget, profile2.total_budget));
    if (budgetSimilarity > 0.8) {
      similarity += budgetSimilarity;
      factors++;
    }

    // Guest count similarity (within 25%)
    const guestDiff = Math.abs(profile1.guest_count - profile2.guest_count);
    const guestSimilarity = 1 - (guestDiff / Math.max(profile1.guest_count, profile2.guest_count));
    if (guestSimilarity > 0.75) {
      similarity += guestSimilarity;
      factors++;
    }

    // Location similarity (same city/state)
    if (profile1.location?.city === profile2.location?.city) {
      similarity += 1.0;
      factors++;
    } else if (profile1.location?.state === profile2.location?.state) {
      similarity += 0.5;
      factors++;
    }

    // Wedding style similarity
    const style1 = profile1.wedding_style || [];
    const style2 = profile2.wedding_style || [];
    const commonStyles = style1.filter(s => style2.includes(s)).length;
    const styleSimilarity = commonStyles / Math.max(style1.length, style2.length, 1);
    if (styleSimilarity > 0.3) {
      similarity += styleSimilarity;
      factors++;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  // Predict vendor availability based on historical data
  predictVendorAvailability(vendor: Vendor, weddingDate: Date): {
    available: boolean;
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let confidence = 0.5;

    // Check if vendor was recently scraped (indicates active business)
    const daysSinceScraped = (Date.now() - new Date(vendor.lastScraped).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceScraped < 30) {
      confidence += 0.2;
      reasons.push('Recently active vendor');
    }

    // Check rating and review count (popular vendors may be booked)
    if (vendor.rating > 4.5 && vendor.reviewCount > 50) {
      confidence -= 0.1;
      reasons.push('Popular vendor - may be booked');
    } else if (vendor.rating > 4.0) {
      confidence += 0.1;
      reasons.push('Good vendor with availability');
    }

    // Check if it's peak wedding season
    const month = weddingDate.getMonth();
    const isPeakSeason = month >= 4 && month <= 9; // May through October
    
    if (isPeakSeason) {
      confidence -= 0.2;
      reasons.push('Peak wedding season - limited availability');
    } else {
      confidence += 0.1;
      reasons.push('Off-season - better availability');
    }

    // Check if vendor is verified/featured (more likely to be available)
    if (vendor.verified) {
      confidence += 0.1;
      reasons.push('Verified vendor');
    }

    return {
      available: confidence > 0.5,
      confidence: Math.min(Math.max(confidence, 0), 1),
      reasons
    };
  }
}
