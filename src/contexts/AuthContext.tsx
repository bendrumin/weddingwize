'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { WeddingProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: WeddingProfile | null;
  loading: boolean;
  signupData: Partial<WeddingProfile> | null;
  signUp: (email: string, password: string, userData: Partial<WeddingProfile>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<WeddingProfile>) => Promise<{ error: Error | null }>;
  clearSignupData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<WeddingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupData, setSignupData] = useState<Partial<WeddingProfile> | null>(null);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('AuthContext: Safety timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 15000); // 15 second safety timeout

    return () => clearTimeout(safetyTimeout);
  }, [loading]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const profilePromise = supabase
        .from('wedding_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const result = await Promise.race([profilePromise, timeoutPromise]) as { data: unknown; error: unknown };
      const { data, error } = result;

      if (error && (error as { code?: string }).code !== 'PGRST116') { // PGRST116 = no rows returned
        // Set a default profile if fetch fails
        setProfile({
          id: userId,
          partner1_name: '',
          partner2_name: '',
          wedding_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          total_budget: 25000,
          guest_count: 100,
          location: { city: '', state: '', zipcode: '' },
          wedding_style: [],
          priorities: {
            venue: 5,
            photography: 4,
            catering: 4,
            flowers: 3,
            music: 3,
            planning: 5,
            attire: 3,
            transportation: 2,
            other: 2,
          },
          planning_stage: 'just_started',
          subscription_tier: 'free',
          subscription_status: 'active',
          onboarding_completed: false,
          created_at: new Date(),
          updated_at: new Date(),
        } as WeddingProfile);
      } else if (data) {
        setProfile(data as WeddingProfile);
      } else {
        // Profile doesn't exist, create a default one
        const { data: newProfile, error: createError } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          .from('wedding_profiles')
          .insert({
            id: userId,
            partner1_name: '',
            partner2_name: '',
            wedding_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            total_budget: 25000,
            guest_count: 100,
            location: { city: '', state: '', zipcode: '' },
            wedding_style: [],
            priorities: {
              venue: 5,
              photography: 4,
              catering: 4,
              flowers: 3,
              music: 3,
              planning: 5,
              attire: 3,
              transportation: 2,
              other: 2,
            },
            planning_stage: 'just_started',
            onboarding_completed: false,
          })
          .select()
          .single();

        if (createError) {
          // Set a default profile even if creation fails
          setProfile({
            id: userId,
            partner1_name: '',
            partner2_name: '',
            wedding_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            total_budget: 25000,
            guest_count: 100,
            location: { city: '', state: '', zipcode: '' },
            wedding_style: [],
            priorities: {
              venue: 5,
              photography: 4,
              catering: 4,
              flowers: 3,
              music: 3,
              planning: 5,
              attire: 3,
              transportation: 2,
              other: 2,
            },
            planning_stage: 'just_started',
            subscription_tier: 'free',
            subscription_status: 'active',
            onboarding_completed: false,
            created_at: new Date(),
            updated_at: new Date(),
          } as WeddingProfile);
        } else {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set a default profile even if there's an error
      setProfile({
        id: userId,
        partner1_name: '',
        partner2_name: '',
        wedding_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        total_budget: 25000,
        guest_count: 100,
        location: { city: '', state: '', zipcode: '' },
        wedding_style: [],
        priorities: {
          venue: 5,
          photography: 4,
          catering: 4,
          flowers: 3,
          music: 3,
          planning: 5,
          attire: 3,
          transportation: 2,
          other: 2,
        },
        planning_stage: 'just_started',
        subscription_tier: 'free',
        subscription_status: 'active',
        onboarding_completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      } as WeddingProfile);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<WeddingProfile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error as Error };
      }

      if (data.user) {
        // Store signup data for onboarding
        setSignupData(userData);
        
        // Don't create profile yet - let onboarding handle it
        console.log('User signed up successfully, redirecting to onboarding');
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error as Error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSignupData(null); // Clear signup data on signout
  };

  const updateProfile = async (updates: Partial<WeddingProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('wedding_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          .from('wedding_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();
      } else {
        // Create new profile
        result = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          .from('wedding_profiles')
          .insert({
            id: user.id,
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (result.error) {
        return { error: result.error as Error };
      }

      // Update local state
      setProfile(result.data);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const clearSignupData = () => {
    setSignupData(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signupData,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearSignupData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
