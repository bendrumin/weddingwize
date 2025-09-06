'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Heart, DollarSign, Users, Calendar, MapPin, Sparkles, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-900">WeddingWise AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.partner1_name && profile.partner2_name 
              ? `${profile.partner1_name} & ${profile.partner2_name}` 
              : 'Couple'}!
          </h1>
          <p className="text-gray-600">
            Let's continue planning your perfect wedding day
          </p>
        </div>

        {/* Wedding Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-pink-500" />
              </div>
              <span className="text-sm text-gray-500">Wedding Date</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatDate(profile.wedding_date)}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {Math.ceil((new Date(profile.wedding_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to go
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-sm text-gray-500">Total Budget</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(profile.total_budget)}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {profile.subscription_tier === 'free' ? 'Free Plan' : 'Premium Plan'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-sm text-gray-500">Guest Count</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {profile.guest_count}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Expected guests
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-500" />
              </div>
              <span className="text-sm text-gray-500">Location</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {profile.location.city}, {profile.location.state}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Wedding location
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6" />
              </div>
              <Sparkles className="h-6 w-6 opacity-80" />
            </div>
            <h3 className="text-xl font-bold mb-2">Budget Optimizer</h3>
            <p className="text-pink-100 mb-4">
              Let AI optimize your budget allocation for maximum value
            </p>
            <button className="bg-white text-pink-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Optimize Budget
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <Sparkles className="h-6 w-6 opacity-80" />
            </div>
            <h3 className="text-xl font-bold mb-2">Find Vendors</h3>
            <p className="text-purple-100 mb-4">
              Discover perfect vendors matched to your style and budget
            </p>
            <button className="bg-white text-purple-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Browse Vendors
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <Sparkles className="h-6 w-6 opacity-80" />
            </div>
            <h3 className="text-xl font-bold mb-2">Timeline</h3>
            <p className="text-blue-100 mb-4">
              Manage your wedding timeline with AI-powered scheduling
            </p>
            <button className="bg-white text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              View Timeline
            </button>
          </div>
        </div>

        {/* Planning Stage */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Planning Progress</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Current Stage: {profile.planning_stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MapPin className="h-6 w-6 text-pink-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">Venue</p>
              <p className="text-xs text-gray-500">Not started</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">Photography</p>
              <p className="text-xs text-gray-500">Not started</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">Catering</p>
              <p className="text-xs text-gray-500">Not started</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">Timeline</p>
              <p className="text-xs text-gray-500">Not started</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
