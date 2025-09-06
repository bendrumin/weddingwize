'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft,
  MapPin, 
  Star, 
  DollarSign, 
  Users, 
  Phone,
  Mail,
  Globe,
  Heart,
  Share2,
  Shield,
  Crown,
  CheckCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import VendorInquiryForm from '@/components/VendorInquiryForm';

interface Vendor {
  id: string;
  name: string;
  category: string;
  businessType: string;
  location: {
    city: string;
    state: string;
    full: string;
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
  contact: {
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
  detailedDescription?: string;
  pricingDetails?: string;
  capacityDetails?: string;
  reviews?: Array<{
    text: string;
    author: string;
  }>;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
  // Comprehensive profile fields
  tagline?: string;
  address?: string;
  neighborhood?: string;
  languages?: string[];
  guestRange?: string;
  maxCapacity?: number;
  ceremoniesAndReceptions?: boolean;
  ceremonyTypes?: string[];
  teamName?: string;
  teamRole?: string;
  responseTime?: string;
  hasContactForm?: boolean;
  awardCount?: number;
  awardType?: string;
  awardSource?: string;
  pricingAvailable?: boolean;
  pricingRequiresContact?: boolean;
  // Amenities
  ceremonyArea?: boolean;
  coveredOutdoorsSpace?: boolean;
  dressingRoom?: boolean;
  handicapAccessible?: boolean;
  indoorEventSpace?: boolean;
  liabilityInsurance?: boolean;
  outdoorEventSpace?: boolean;
  receptionArea?: boolean;
  wirelessInternet?: boolean;
  // Settings
  ballroom?: boolean;
  garden?: boolean;
  historicVenue?: boolean;
  industrialWarehouse?: boolean;
  trees?: boolean;
  // Service offerings
  barAndDrinksAvailable?: boolean;
  barRental?: boolean;
  cakesAndDessertsAvailable?: boolean;
  cupcakes?: boolean;
  otherDesserts?: boolean;
  foodAndCateringAvailable?: boolean;
  planningAvailable?: boolean;
  seHablaEspanol?: boolean;
  weddingDesign?: boolean;
  rentalsAndEquipmentAvailable?: boolean;
  tents?: boolean;
  serviceStaffAvailable?: boolean;
  transportationAvailable?: boolean;
  shuttleService?: boolean;
  // Reviews
  ratingBreakdown?: Record<string, unknown>;
  aiSummary?: string;
  sortOptions?: string[];
  individualReviews?: Array<{
    author: string;
    rating: number;
    date: string;
    content: string;
    highlighted: boolean;
    venueResponse?: {
      date: string;
      content: string;
    };
  }>;
  // Team
  teamDescription?: string;
  teamMessage?: string;
  // Media
  primaryImage?: string;
  reviewPhotos?: string[];
  // Metadata
  sourceUrl?: string;
  pageType?: string;
}

export default function VendorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadVendor();
    }
  }, [id, loadVendor]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/vendors/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setVendor(data.vendor);
      } else if (response.status === 404) {
        setError('Vendor not found');
      } else {
        setError('Failed to load vendor details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error loading vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (min: number, max: number) => {
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const nextImage = () => {
    if (vendor?.portfolioImages && vendor.portfolioImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === vendor.portfolioImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (vendor?.portfolioImages && vendor.portfolioImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? vendor.portfolioImages.length - 1 : prev - 1
      );
    }
  };

  const handleContactVendor = () => {
    setShowInquiryForm(true);
  };

  const handleShareVendor = () => {
    if (navigator.share) {
      navigator.share({
        title: vendor?.name,
        text: `Check out ${vendor?.name} on WeddingWize!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Vendors
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorited 
                    ? 'bg-pink-100 text-pink-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShareVendor}
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vendor Header */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {vendor.name}
                    </h1>
                    {vendor.verified && (
                      <span className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                        <Shield className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    )}
                    {vendor.featured && (
                      <span className="flex items-center text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                        <Crown className="h-4 w-4 mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{vendor.location.full}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-1 text-yellow-500" />
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="ml-1">({vendor.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-1" />
                      <span>{formatPrice(vendor.pricing.min, vendor.pricing.max)}</span>
                    </div>
                  </div>

                  {vendor.pricing.description && (
                    <div className="text-sm text-gray-600 mb-4">
                      Pricing: {vendor.pricing.description}
                    </div>
                  )}

                  <p className="text-gray-700 text-lg leading-relaxed">
                    {vendor.detailedDescription || vendor.description}
                  </p>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.specialties.map((specialty, idx) => (
                    <span key={idx} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Information */}
              {(vendor.pricingDetails || vendor.capacityDetails) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendor.pricingDetails && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Pricing Details</h4>
                        <p className="text-gray-600 text-sm">{vendor.pricingDetails}</p>
                      </div>
                    )}
                    {vendor.capacityDetails && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Capacity Details</h4>
                        <p className="text-gray-600 text-sm">{vendor.capacityDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Venue Details */}
              {vendor.category === 'venue' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vendor.capacity && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Capacity</h3>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-2" />
                        <span>{vendor.capacity.description}</span>
                        {vendor.capacity.min && vendor.capacity.max && (
                          <span className="ml-2 text-sm">
                            ({vendor.capacity.min} - {vendor.capacity.max} guests)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {vendor.venueType && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Venue Type</h3>
                      <div className="text-gray-600">{vendor.venueType}</div>
                    </div>
                  )}

                  {vendor.amenities && vendor.amenities.length > 0 && (
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.amenities.map((amenity, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comprehensive Profile Information */}
              {(vendor.tagline || vendor.address || vendor.neighborhood) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Venue Information</h3>
                  <div className="space-y-3">
                    {vendor.tagline && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Tagline</h4>
                        <p className="text-gray-600 text-sm italic">{vendor.tagline}</p>
                      </div>
                    )}
                    {vendor.address && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Address</h4>
                        <p className="text-gray-600 text-sm">{vendor.address}</p>
                      </div>
                    )}
                    {vendor.neighborhood && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Neighborhood</h4>
                        <p className="text-gray-600 text-sm">{vendor.neighborhood}</p>
                      </div>
                    )}
                    {vendor.languages && vendor.languages.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.languages.map((language, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Capacity Information */}
              {(vendor.guestRange || vendor.maxCapacity || vendor.ceremoniesAndReceptions) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Capacity & Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendor.guestRange && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Guest Range</h4>
                        <p className="text-gray-600 text-sm">{vendor.guestRange}</p>
                      </div>
                    )}
                    {vendor.maxCapacity && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Maximum Capacity</h4>
                        <p className="text-gray-600 text-sm">{vendor.maxCapacity} guests</p>
                      </div>
                    )}
                    {vendor.ceremoniesAndReceptions && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-1">Services</h4>
                        <p className="text-gray-600 text-sm">✓ Holds ceremonies and receptions</p>
                      </div>
                    )}
                    {vendor.ceremonyTypes && vendor.ceremonyTypes.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-1">Ceremony Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.ceremonyTypes.map((type, idx) => (
                            <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Team Information */}
              {(vendor.teamName || vendor.teamRole || vendor.responseTime) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Information</h3>
                  <div className="space-y-3">
                    {vendor.teamName && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Team Name</h4>
                        <p className="text-gray-600 text-sm">{vendor.teamName}</p>
                      </div>
                    )}
                    {vendor.teamRole && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Role</h4>
                        <p className="text-gray-600 text-sm">{vendor.teamRole}</p>
                      </div>
                    )}
                    {vendor.responseTime && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Response Time</h4>
                        <p className="text-gray-600 text-sm">{vendor.responseTime}</p>
                      </div>
                    )}
                    {vendor.teamDescription && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Team Description</h4>
                        <p className="text-gray-600 text-sm">{vendor.teamDescription}</p>
                      </div>
                    )}
                    {vendor.teamMessage && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Team Message</h4>
                        <p className="text-gray-600 text-sm italic">{vendor.teamMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Awards & Recognition */}
              {(vendor.awardCount && vendor.awardCount > 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Awards & Recognition</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Crown className="h-6 w-6 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-800">{vendor.awardType}</h4>
                        {vendor.awardSource && (
                          <p className="text-yellow-700 text-sm">{vendor.awardSource}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Amenities */}
              {(vendor.ceremonyArea || vendor.outdoorEventSpace || vendor.handicapAccessible || vendor.wirelessInternet) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities & Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vendor.ceremonyArea && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Ceremony Area</span>
                      </div>
                    )}
                    {vendor.outdoorEventSpace && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Outdoor Event Space</span>
                      </div>
                    )}
                    {vendor.indoorEventSpace && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Indoor Event Space</span>
                      </div>
                    )}
                    {vendor.receptionArea && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Reception Area</span>
                      </div>
                    )}
                    {vendor.dressingRoom && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Dressing Room</span>
                      </div>
                    )}
                    {vendor.handicapAccessible && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Handicap Accessible</span>
                      </div>
                    )}
                    {vendor.wirelessInternet && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Wireless Internet</span>
                      </div>
                    )}
                    {vendor.coveredOutdoorsSpace && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Covered Outdoors Space</span>
                      </div>
                    )}
                    {vendor.liabilityInsurance && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Liability Insurance</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Venue Settings & Style */}
              {(vendor.ballroom || vendor.garden || vendor.historicVenue || vendor.industrialWarehouse || vendor.trees) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Venue Settings & Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.ballroom && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        Ballroom
                      </span>
                    )}
                    {vendor.garden && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Garden
                      </span>
                    )}
                    {vendor.historicVenue && (
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                        Historic Venue
                      </span>
                    )}
                    {vendor.industrialWarehouse && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        Industrial/Warehouse
                      </span>
                    )}
                    {vendor.trees && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Trees
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Service Offerings */}
              {(vendor.barAndDrinksAvailable || vendor.foodAndCateringAvailable || vendor.planningAvailable || vendor.transportationAvailable) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Offerings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendor.barAndDrinksAvailable && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Bar & Drinks</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">✓ Bar and drinks available</p>
                          {vendor.barRental && <p className="text-sm text-gray-600">✓ Bar rental</p>}
                        </div>
                      </div>
                    )}
                    {vendor.foodAndCateringAvailable && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Food & Catering</h4>
                        <p className="text-sm text-gray-600">✓ Food and catering available</p>
                      </div>
                    )}
                    {vendor.planningAvailable && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Planning</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">✓ Planning available</p>
                          {vendor.seHablaEspanol && <p className="text-sm text-gray-600">✓ Se habla español</p>}
                          {vendor.weddingDesign && <p className="text-sm text-gray-600">✓ Wedding design</p>}
                        </div>
                      </div>
                    )}
                    {vendor.transportationAvailable && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Transportation</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">✓ Transportation available</p>
                          {vendor.shuttleService && <p className="text-sm text-gray-600">✓ Shuttle service</p>}
                        </div>
                      </div>
                    )}
                    {vendor.cakesAndDessertsAvailable && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Cakes & Desserts</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">✓ Cakes and desserts available</p>
                          {vendor.cupcakes && <p className="text-sm text-gray-600">✓ Cupcakes</p>}
                          {vendor.otherDesserts && <p className="text-sm text-gray-600">✓ Other desserts</p>}
                        </div>
                      </div>
                    )}
                    {vendor.rentalsAndEquipmentAvailable && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Rentals & Equipment</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">✓ Rentals and equipment available</p>
                          {vendor.tents && <p className="text-sm text-gray-600">✓ Tents</p>}
                        </div>
                      </div>
                    )}
                    {vendor.serviceStaffAvailable && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Service Staff</h4>
                        <p className="text-sm text-gray-600">✓ Service staff available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Pricing Information */}
              {vendor.pricingAvailable !== undefined && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {vendor.pricingAvailable ? (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Pricing Details Available</h4>
                        {vendor.pricingDetails && (
                          <p className="text-gray-600 text-sm">{vendor.pricingDetails}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Pricing Information</h4>
                        <p className="text-gray-600 text-sm">
                          {vendor.pricingRequiresContact 
                            ? "Contact venue for pricing details" 
                            : "No pricing details available yet"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {vendor.aiSummary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Summary</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">{vendor.aiSummary}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio Gallery */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
              
              {vendor.portfolioImages && vendor.portfolioImages.length > 0 ? (
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                    <img
                      src={vendor.portfolioImages[currentImageIndex]}
                      alt={`${vendor.name} portfolio ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {vendor.portfolioImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {vendor.portfolioImages.length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      {vendor.portfolioImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            idx === currentImageIndex ? 'bg-pink-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>No portfolio images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
              
              <div className="text-center mb-6">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {vendor.rating} out of 5 stars
                </h3>
                <p className="text-gray-600 mb-4">
                  Based on {vendor.reviewCount} reviews
                </p>
              </div>

              {(vendor.reviews && vendor.reviews.length > 0) || (vendor.individualReviews && vendor.individualReviews.length > 0) ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  
                  {/* Individual Reviews from comprehensive profile */}
                  {vendor.individualReviews && vendor.individualReviews.length > 0 ? (
                    <div className="space-y-4">
                      {vendor.individualReviews.map((review, index) => (
                        <div key={index} className={`border-l-4 pl-4 py-3 ${review.highlighted ? 'border-yellow-500 bg-yellow-50' : 'border-pink-500'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-900 ml-2">{review.author}</span>
                            </div>
                            {review.date && (
                              <span className="text-xs text-gray-500">{review.date}</span>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2">{review.content}</p>
                          {review.venueResponse && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-2">
                              <div className="flex items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">Venue Response</span>
                                {review.venueResponse.date && (
                                  <span className="text-xs text-gray-500 ml-2">{review.venueResponse.date}</span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">{review.venueResponse.content}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback to basic reviews */
                    <div className="space-y-4">
                      {vendor.reviews?.map((review, index) => (
                        <div key={index} className="border-l-4 border-pink-500 pl-4 py-2">
                          <div className="flex items-center mb-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium text-gray-900">{review.author}</span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    Detailed reviews coming soon!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Vendor</h3>
                
                <div className="space-y-4">
                  {(vendor.contactWebsite || vendor.contact?.website) && (
                    <a
                      href={vendor.contactWebsite || vendor.contact?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Globe className="h-5 w-5 mr-3" />
                      <span>Visit Website</span>
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  )}
                  
                  {(vendor.contactPhone || vendor.contact?.phone) && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-3" />
                      <span>{vendor.contactPhone || vendor.contact?.phone}</span>
                    </div>
                  )}
                  
                  {(vendor.contactEmail || vendor.contact?.email) && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-5 w-5 mr-3" />
                      <span>{vendor.contactEmail || vendor.contact?.email}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleContactVendor}
                  className="w-full mt-6 bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                >
                  Send Inquiry
                </button>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium capitalize">{vendor.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Business Type</span>
                    <span className="font-medium capitalize">{vendor.businessType}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price Range</span>
                    <span className="font-medium">{formatPrice(vendor.pricing.min, vendor.pricing.max)}</span>
                  </div>
                  
                  {vendor.lastScraped && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium text-sm">
                        {new Date(vendor.lastScraped).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety & Trust */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety & Trust</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm text-gray-600">Verified business information</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm text-gray-600">Real customer reviews</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm text-gray-600">Secure messaging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      {showInquiryForm && vendor && (
        <VendorInquiryForm
          vendorId={vendor.id}
          vendorName={vendor.name}
          onClose={() => setShowInquiryForm(false)}
        />
      )}
    </div>
  );
}
