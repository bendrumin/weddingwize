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
  signUp: (email: string, password: string, userData: Partial<WeddingProfile>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<WeddingProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<WeddingProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
      const { data, error } = await supabase
        .from('wedding_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
      } else {
        // Profile doesn't exist, create a default one
        console.log('Creating default profile for user');
        const { data: newProfile, error: createError } = await supabase
          .from('wedding_profiles')
          .insert({
            id: userId,
            partner1_name: '',
            partner2_name: '',
            wedding_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
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
          console.error('Error creating default profile:', createError);
        } else {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
        return { error };
      }

      if (data.user) {
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create wedding profile with explicit user context
        const { error: profileError } = await supabase
          .from('wedding_profiles')
          .insert({
            id: data.user.id,
            ...userData,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't return error here - let the user sign up and create profile later
          console.log('Profile will be created on first login');
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<WeddingProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('wedding_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
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
