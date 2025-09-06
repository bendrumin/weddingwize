// Core business objects for WeddingWise AI

export interface Location {
  city: string;
  state: string;
  zipcode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface WeddingProfile {
  id: string;
  partner1_name?: string;
  partner2_name?: string;
  wedding_date: Date;
  total_budget: number;
  guest_count: number;
  location: Location;
  wedding_style: WeddingStyle[];
  priorities: CategoryPriorities;
  planning_stage: PlanningStage;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export type WeddingStyle = 
  | 'modern' 
  | 'rustic' 
  | 'elegant' 
  | 'outdoor' 
  | 'vintage' 
  | 'bohemian' 
  | 'classic' 
  | 'minimalist' 
  | 'romantic' 
  | 'industrial';

export type PlanningStage = 
  | 'just_started' 
  | 'venue_hunting' 
  | 'vendor_selection' 
  | 'details_planning' 
  | 'final_preparations';

export type SubscriptionTier = 'free' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface CategoryPriorities {
  venue: number;
  photography: number;
  catering: number;
  flowers: number;
  music: number;
  planning: number;
  attire: number;
  transportation: number;
  other: number;
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  business_type?: 'individual' | 'company' | 'corporation';
  location: Location;
  pricing: PricingInfo;
  contact: ContactInfo;
  portfolio_images: string[];
  description?: string;
  specialties: string[];
  availability_calendar: AvailabilityCalendar;
  rating: number;
  review_count: number;
  reviews_summary: ReviewsSummary;
  last_scraped?: Date;
  verified: boolean;
  featured: boolean;
  lead_fee_percentage: number;
  created_at: Date;
}

export type VendorCategory = 
  | 'venue' 
  | 'photography' 
  | 'catering' 
  | 'flowers' 
  | 'music' 
  | 'planning' 
  | 'attire' 
  | 'transportation' 
  | 'decor' 
  | 'beauty';

export interface PricingInfo {
  min: number;
  max: number;
  currency: string;
  per_unit: string; // 'per_person', 'per_hour', 'flat_rate', etc.
  notes?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface AvailabilityCalendar {
  [date: string]: {
    available: boolean;
    price_modifier?: number; // multiplier for peak dates
    notes?: string;
  };
}

export interface ReviewsSummary {
  overall_sentiment: 'positive' | 'neutral' | 'negative';
  common_themes: string[];
  average_rating: number;
  total_reviews: number;
}

export interface BudgetAllocation {
  id: string;
  user_id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  ai_recommended_amount?: number;
  user_priority_score: number;
  market_percentage: number;
  is_ai_optimized: boolean;
  created_at: Date;
}

export interface VendorMatch {
  id: string;
  user_id: string;
  vendor_id: string;
  compatibility_score: number;
  match_reasons: string[];
  user_action?: 'viewed' | 'contacted' | 'bookmarked' | 'rejected';
  contacted_at?: Date;
  booking_status?: 'inquired' | 'quoted' | 'booked' | 'rejected';
  lead_fee_earned?: number;
  created_at: Date;
}

export interface TimelineTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  due_date: Date;
  completed_at?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_hours?: number;
  depends_on: string[];
  auto_generated: boolean;
  vendor_related?: string;
  created_at: Date;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Guest {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
  dietary_restrictions: string[];
  accessibility_needs: string[];
  rsvp_status: RSVPStatus;
  plus_one_allowed: boolean;
  plus_one_name?: string;
  table_assignment?: number;
  meal_choice?: string;
  gift_received: boolean;
  invitation_sent_at?: Date;
  rsvp_received_at?: Date;
  created_at: Date;
}

export type RSVPStatus = 'pending' | 'attending' | 'not_attending' | 'maybe';

export interface ScrapingJob {
  id: string;
  job_type: string;
  target_location: Location;
  status: ScrapingStatus;
  vendors_found: number;
  vendors_updated: number;
  errors_encountered: string[];
  started_at?: Date;
  completed_at?: Date;
  next_run_at?: Date;
  created_at: Date;
}

export type ScrapingStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface UserAnalytics {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  session_id: string;
  created_at: Date;
}

// AI and optimization interfaces
export interface MarketData {
  location: string;
  guestCount: number;
  averagePrices: Record<string, number>;
  priceRanges: Record<string, { min: number; max: number }>;
  marketTrends: Record<string, 'increasing' | 'stable' | 'decreasing'>;
}

export interface BudgetOptimizationResult {
  allocations: BudgetAllocation[];
  totalOptimized: number;
  savings: number;
  confidence: number;
  recommendations: string[];
}

export interface VendorCompatibilityScore {
  vendorId: string;
  score: number;
  reasons: string[];
  strengths: string[];
  concerns: string[];
}

export interface TimelineOptimization {
  tasks: TimelineTask[];
  criticalPath: string[];
  riskFactors: string[];
  suggestions: string[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface OnboardingFormData {
  coupleNames: {
    partner1: string;
    partner2: string;
  };
  weddingDate: string;
  budget: number;
  guestCount: number;
  location: Location;
  weddingStyle: WeddingStyle[];
  priorities: CategoryPriorities;
}

export interface BudgetFormData {
  totalBudget: number;
  priorities: CategoryPriorities;
  customAllocations?: Record<string, number>;
}

// Subscription and billing
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    vendorMatches: number;
    budgetCategories: number;
    guestCount: number;
    timelineItems: number;
  };
}

export interface BillingInfo {
  customerId: string;
  subscriptionId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}
