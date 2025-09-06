import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Server-side Supabase client
export const createServerClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Database types (generated from Supabase)
export type Database = {
  public: {
    Tables: {
      wedding_profiles: {
        Row: {
          id: string;
          partner1_name: string | null;
          partner2_name: string | null;
          wedding_date: string;
          total_budget: number;
          guest_count: number;
          location: Record<string, unknown>;
          wedding_style: string[];
          priorities: Record<string, unknown>;
          planning_stage: string;
          subscription_tier: string;
          subscription_status: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          partner1_name?: string | null;
          partner2_name?: string | null;
          wedding_date: string;
          total_budget: number;
          guest_count: number;
          location: Record<string, unknown>;
          wedding_style?: string[];
          priorities?: any;
          planning_stage?: string;
          subscription_tier?: string;
          subscription_status?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          partner1_name?: string | null;
          partner2_name?: string | null;
          wedding_date?: string;
          total_budget?: number;
          guest_count?: number;
          location?: any;
          wedding_style?: string[];
          priorities?: any;
          planning_stage?: string;
          subscription_tier?: string;
          subscription_status?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          category: string;
          business_type: string | null;
          location: Record<string, unknown>;
          pricing: any;
          contact: any;
          portfolio_images: string[];
          description: string | null;
          specialties: string[];
          availability_calendar: any;
          rating: number | null;
          review_count: number;
          reviews_summary: any;
          last_scraped: string | null;
          verified: boolean;
          featured: boolean;
          lead_fee_percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          business_type?: string | null;
          location: Record<string, unknown>;
          pricing: any;
          contact: any;
          portfolio_images?: string[];
          description?: string | null;
          specialties?: string[];
          availability_calendar?: any;
          rating?: number | null;
          review_count?: number;
          reviews_summary?: any;
          last_scraped?: string | null;
          verified?: boolean;
          featured?: boolean;
          lead_fee_percentage?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          business_type?: string | null;
          location?: any;
          pricing?: any;
          contact?: any;
          portfolio_images?: string[];
          description?: string | null;
          specialties?: string[];
          availability_calendar?: any;
          rating?: number | null;
          review_count?: number;
          reviews_summary?: any;
          last_scraped?: string | null;
          verified?: boolean;
          featured?: boolean;
          lead_fee_percentage?: number;
          created_at?: string;
        };
      };
      budget_allocations: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          allocated_amount: number;
          spent_amount: number;
          ai_recommended_amount: number | null;
          user_priority_score: number;
          market_percentage: number;
          is_ai_optimized: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          allocated_amount: number;
          spent_amount?: number;
          ai_recommended_amount?: number | null;
          user_priority_score: number;
          market_percentage: number;
          is_ai_optimized?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          allocated_amount?: number;
          spent_amount?: number;
          ai_recommended_amount?: number | null;
          user_priority_score?: number;
          market_percentage?: number;
          is_ai_optimized?: boolean;
          created_at?: string;
        };
      };
      vendor_matches: {
        Row: {
          id: string;
          user_id: string;
          vendor_id: string;
          compatibility_score: number;
          match_reasons: string[];
          user_action: string | null;
          contacted_at: string | null;
          booking_status: string | null;
          lead_fee_earned: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vendor_id: string;
          compatibility_score: number;
          match_reasons?: string[];
          user_action?: string | null;
          contacted_at?: string | null;
          booking_status?: string | null;
          lead_fee_earned?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vendor_id?: string;
          compatibility_score?: number;
          match_reasons?: string[];
          user_action?: string | null;
          contacted_at?: string | null;
          booking_status?: string | null;
          lead_fee_earned?: number | null;
          created_at?: string;
        };
      };
      timeline_tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          due_date: string;
          completed_at: string | null;
          status: string;
          priority: string;
          estimated_hours: number | null;
          depends_on: string[];
          auto_generated: boolean;
          vendor_related: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          due_date: string;
          completed_at?: string | null;
          status?: string;
          priority?: string;
          estimated_hours?: number | null;
          depends_on?: string[];
          auto_generated?: boolean;
          vendor_related?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          due_date?: string;
          completed_at?: string | null;
          status?: string;
          priority?: string;
          estimated_hours?: number | null;
          depends_on?: string[];
          auto_generated?: boolean;
          vendor_related?: string | null;
          created_at?: string;
        };
      };
      guests: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          relationship: string;
          dietary_restrictions: string[];
          accessibility_needs: string[];
          rsvp_status: string;
          plus_one_allowed: boolean;
          plus_one_name: string | null;
          table_assignment: number | null;
          meal_choice: string | null;
          gift_received: boolean;
          invitation_sent_at: string | null;
          rsvp_received_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          relationship: string;
          dietary_restrictions?: string[];
          accessibility_needs?: string[];
          rsvp_status?: string;
          plus_one_allowed?: boolean;
          plus_one_name?: string | null;
          table_assignment?: number | null;
          meal_choice?: string | null;
          gift_received?: boolean;
          invitation_sent_at?: string | null;
          rsvp_received_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          relationship?: string;
          dietary_restrictions?: string[];
          accessibility_needs?: string[];
          rsvp_status?: string;
          plus_one_allowed?: boolean;
          plus_one_name?: string | null;
          table_assignment?: number | null;
          meal_choice?: string | null;
          gift_received?: boolean;
          invitation_sent_at?: string | null;
          rsvp_received_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
