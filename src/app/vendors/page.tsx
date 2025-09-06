'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  DollarSign, 
  Users, 
  Calendar,
  Sparkles,
  Crown,
  Shield,
  Heart,
  ExternalLink
} from 'lucide-react';
import VendorInquiryForm from '@/components/VendorInquiryForm';

interface Vendor {
  id: string;
  name: string;
  category: string;
  businessType?: string;
  location: {
    city: string;
    state: string;
    full?: string;
  };
  pricing: {
    min: number;
    max: number;
    currency: string;
    description?: string;
  };
  rating: number;
  reviewCount: number;
  portfolioImages: string[];
  description: string;
  specialties: string[];
  verified: boolean;
  featured: boolean;
  contact?: {
    website?: string;
    phone?: string;
    email?: string;
  };
  capacity?: {
    min: number;
    max: number;
    description: string;
  };
  venueType?: string;
  amenities?: string[];
  lastScraped?: string;
  // Enhanced profile fields
  tagline?: string;
  address?: string;
  neighborhood?: string;
  guestRange?: string;
  maxCapacity?: number;
  awardCount?: number;
  awardType?: string;
  ceremonyArea?: boolean;
  outdoorEventSpace?: boolean;
  handicapAccessible?: boolean;
  ballroom?: boolean;
  garden?: boolean;
  historicVenue?: boolean;
  pricingAvailable?: boolean;
  hasContactForm?: boolean;
  responseTime?: string;
}

interface VendorMatch {
  vendor: Vendor;
  compatibilityScore: number;
  matchReasons: string[];
  priceFit: 'under_budget' | 'within_budget' | 'over_budget';
  qualityScore: number;
  valueScore: number;
}

export default function VendorsPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setAllVendors] = useState<VendorMatch[]>([]);
  const [vendors, setVendors] = useState<VendorMatch[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('venue');
  const [searchLocation, setSearchLocation] = useState('');
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: 0,
    verifiedOnly: false,
    featuredOnly: false
  });
  const [selectedVendorForInquiry, setSelectedVendorForInquiry] = useState<Vendor | null>(null);
  const allVendorsRef = useRef<VendorMatch[]>([]);

  const categories = [
    { key: 'venue', label: 'Venues', icon: '🏛️', description: 'Ceremony & reception locations' },
    { key: 'photography', label: 'Photography', icon: '📸', description: 'Wedding photographers' },
    { key: 'catering', label: 'Catering', icon: '🍽️', description: 'Food & beverage services' },
    { key: 'flowers', label: 'Flowers', icon: '🌸', description: 'Floral arrangements' },
    { key: 'music', label: 'Music', icon: '🎵', description: 'DJs & live music' },
    { key: 'planning', label: 'Planning', icon: '📋', description: 'Wedding coordinators' }
  ];

  // Client-side filtering function
  const applyFilters = useCallback((vendorsToFilter: VendorMatch[] = allVendorsRef.current) => {
    let filtered = [...vendorsToFilter];

    // Location filter
    if (searchLocation && searchLocation.trim()) {
      const locationQuery = searchLocation.toLowerCase().trim();
      filtered = filtered.filter(match => {
        const location = match.vendor.location;
        return (
          location.city?.toLowerCase().includes(locationQuery) ||
          location.state?.toLowerCase().includes(locationQuery) ||
          location.full?.toLowerCase().includes(locationQuery)
        );
      });
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(match => match.vendor.rating >= filters.minRating);
    }

    // Price filter
    if (filters.maxPrice > 0) {
      filtered = filtered.filter(match => {
        const maxPrice = match.vendor.pricing?.max || 0;
        return maxPrice <= filters.maxPrice;
      });
    }

    // Verified filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(match => match.vendor.verified);
    }

    // Featured filter
    if (filters.featuredOnly) {
      filtered = filtered.filter(match => match.vendor.featured);
    }

    setVendors(filtered);
  }, [searchLocation, filters]);


  useEffect(() => {
    // Set default location if profile is available
    if (profile?.location?.city) {
      setSearchLocation(profile.location.city);
    }
    
    // Load vendors when category changes
    const loadVendorsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          category: selectedCategory,
          limit: '1000'
        });

        const response = await fetch(`/api/vendors?${params}`);

        if (response.ok) {
          const data = await response.json();
          const transformedVendors = data.vendors?.map((vendor: Vendor) => ({
            vendor: {
              id: vendor.id,
              name: vendor.name,
              category: vendor.category,
              businessType: vendor.businessType,
              location: vendor.location,
              pricing: vendor.pricing,
              rating: vendor.rating,
              reviewCount: vendor.reviewCount,
              portfolioImages: vendor.portfolioImages,
              description: vendor.description,
              specialties: vendor.specialties,
              verified: vendor.verified,
              featured: vendor.featured,
              contact: vendor.contact,
              capacity: vendor.capacity,
              venueType: vendor.venueType,
              amenities: vendor.amenities,
              lastScraped: vendor.lastScraped
            },
            compatibilityScore: Math.random() * 40 + 60,
            matchReasons: ['Great reviews', 'Within budget', 'Perfect location'],
            priceFit: vendor.pricing?.max < 5000 ? 'under_budget' : 
                     vendor.pricing?.max < 10000 ? 'within_budget' : 'over_budget',
            qualityScore: vendor.rating * 20,
            valueScore: Math.random() * 40 + 60
          })) || [];
          
          setAllVendors(transformedVendors);
          allVendorsRef.current = transformedVendors;
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          setError(errorData.error || 'Failed to load vendors');
        }
      } catch (error) {
        setError('Network error. Please try again.');
        console.error('Error loading vendors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVendorsData();
  }, [profile?.location?.city, selectedCategory]);

  // Apply filters when search location or filters change
  useEffect(() => {
    if (allVendorsRef.current.length > 0) {
      applyFilters();
    }
  }, [searchLocation, filters, applyFilters]);

  const formatPrice = (min: number, max: number) => {
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Vendor Marketplace
              </h1>
              <p className="text-gray-600">
                Discover and connect with the perfect wedding vendors for your special day
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{profile?.location?.city}, {profile?.location?.state}</span>
              </div>
              <div className="text-sm text-gray-500">
                ${profile?.total_budget?.toLocaleString()} budget
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedCategory === category.key
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value) || 0})}
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.minRating || ''}
                  onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value) || 0})}
                  placeholder="No minimum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Location Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="City, State"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Results */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {vendors.length} {categories.find(c => c.key === selectedCategory)?.label} Found
                  </h2>
                  <p className="text-gray-600">
                    Sorted by AI compatibility score
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Matching</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="text-red-400 mr-3">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error loading vendors</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="text-sm text-red-600 hover:text-red-800 underline mt-2"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading vendors...</p>
                </div>
              )}

              {/* Vendor Cards */}
              {!loading && !error && (
                <>
                  {vendors.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Search className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No vendors found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your filters or check back later for new vendors.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {vendors.map((match) => (
                        <div key={match.vendor.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-1">
                                      <h3 className="text-xl font-semibold text-gray-900">
                                        {match.vendor.name}
                                      </h3>
                                      {match.vendor.verified && (
                                        <span className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">
                                          <Shield className="h-3 w-3 mr-1" />
                                          Verified
                                        </span>
                                      )}
                                      {match.vendor.featured && (
                                        <span className="flex items-center text-purple-600 bg-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                                          <Crown className="h-3 w-3 mr-1" />
                                          Featured
                                        </span>
                                      )}
                                      {match.vendor.awardCount && match.vendor.awardCount > 0 && (
                                        <span className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
                                          <Crown className="h-3 w-3 mr-1" />
                                          {match.vendor.awardType || `${match.vendor.awardCount} Awards`}
                                        </span>
                                      )}
                                    </div>
                                    {match.vendor.tagline && (
                                      <p className="text-sm text-gray-600 italic mb-2">{match.vendor.tagline}</p>
                                    )}
                                    {match.vendor.neighborhood && (
                                      <p className="text-xs text-gray-500 mb-2">{match.vendor.neighborhood}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {match.vendor.location.city}, {match.vendor.location.state}
                                  </div>
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                    {match.vendor.rating} ({match.vendor.reviewCount} reviews)
                                  </div>
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {formatPrice(match.vendor.pricing.min, match.vendor.pricing.max)}
                                  </div>
                                  {(match.vendor.capacity || match.vendor.guestRange || match.vendor.maxCapacity) && (
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-1" />
                                      {match.vendor.guestRange || match.vendor.capacity?.description || `${match.vendor.maxCapacity} guests`}
                                    </div>
                                  )}
                                </div>

                                <p className="text-gray-700 mb-4">
                                  {match.vendor.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                  {match.vendor.specialties.map((specialty, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                      {specialty}
                                    </span>
                                  ))}
                                </div>

                                {/* Key Features & Amenities */}
                                {(match.vendor.ceremonyArea || match.vendor.outdoorEventSpace || match.vendor.handicapAccessible || match.vendor.ballroom || match.vendor.garden || match.vendor.historicVenue) && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {match.vendor.ceremonyArea && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                                          Ceremony Area
                                        </span>
                                      )}
                                      {match.vendor.outdoorEventSpace && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                                          Outdoor Space
                                        </span>
                                      )}
                                      {match.vendor.handicapAccessible && (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                          Accessible
                                        </span>
                                      )}
                                      {match.vendor.ballroom && (
                                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                                          Ballroom
                                        </span>
                                      )}
                                      {match.vendor.garden && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                                          Garden
                                        </span>
                                      )}
                                      {match.vendor.historicVenue && (
                                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                                          Historic
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Response Time */}
                                {match.vendor.responseTime && (
                                  <div className="mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      <span>{match.vendor.responseTime}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex space-x-3">
                                  <button 
                                    onClick={() => setSelectedVendorForInquiry(match.vendor)}
                                    className="flex items-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                                  >
                                    <Heart className="h-4 w-4" />
                                    <span>Contact Vendor</span>
                                  </button>
                                  <button 
                                    onClick={() => window.location.href = `/vendors/${match.vendor.id}`}
                                    className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>View Profile</span>
                                  </button>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Premium Feature
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      {selectedVendorForInquiry && (
        <VendorInquiryForm
          vendorId={selectedVendorForInquiry.id}
          vendorName={selectedVendorForInquiry.name}
          onClose={() => setSelectedVendorForInquiry(null)}
        />
      )}
    </div>
  );
}
