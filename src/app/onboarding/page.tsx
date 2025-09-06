'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { WeddingProfile, Location, WeddingStyle, CategoryPriorities, PlanningStage } from '@/types';

export default function OnboardingPage() {
  const { user, profile, signupData, updateProfile, clearSignupData } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partner1Name: '',
    partner2Name: '',
    weddingDate: '',
    totalBudget: 25000,
    guestCount: 100,
    city: '',
    state: '',
    zipcode: '',
    weddingStyles: [] as WeddingStyle[],
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
    } as CategoryPriorities,
    planningStage: 'just_started' as PlanningStage,
  });

  const weddingStyleOptions: { value: WeddingStyle; label: string }[] = [
    { value: 'modern', label: 'Modern' },
    { value: 'rustic', label: 'Rustic' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'bohemian', label: 'Bohemian' },
    { value: 'classic', label: 'Classic' },
    { value: 'minimalist', label: 'Minimalist' },
  ];

  const planningStageOptions: { value: PlanningStage; label: string }[] = [
    { value: 'just_started', label: 'Just Started' },
    { value: 'venue_hunting', label: 'Venue Hunting' },
    { value: 'vendor_selection', label: 'Vendor Selection' },
    { value: 'details_planning', label: 'Detailed Planning' },
    { value: 'final_preparations', label: 'Final Preparations' },
  ];

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Pre-fill form with signup data first, then existing profile data
    const dataSource = signupData || profile;
    if (dataSource) {
      setFormData({
        partner1Name: dataSource.partner1_name || '',
        partner2Name: dataSource.partner2_name || '',
        weddingDate: dataSource.wedding_date ? new Date(dataSource.wedding_date).toISOString().split('T')[0] : '',
        totalBudget: dataSource.total_budget || 25000,
        guestCount: dataSource.guest_count || 100,
        city: dataSource.location?.city || '',
        state: dataSource.location?.state || '',
        zipcode: dataSource.location?.zipcode || '',
        weddingStyles: dataSource.wedding_style || [],
        priorities: dataSource.priorities || formData.priorities,
        planningStage: dataSource.planning_stage || 'just_started',
      });
    }
  }, [user, profile, signupData, router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStyleToggle = (style: WeddingStyle) => {
    setFormData(prev => ({
      ...prev,
      weddingStyles: prev.weddingStyles.includes(style)
        ? prev.weddingStyles.filter(s => s !== style)
        : [...prev.weddingStyles, style],
    }));
  };

  const handlePriorityChange = (category: keyof CategoryPriorities, value: number) => {
    setFormData(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [category]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const location: Location = {
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        coordinates: undefined, // Will be geocoded later
      };

      const profileData: Partial<WeddingProfile> = {
        partner1_name: formData.partner1Name,
        partner2_name: formData.partner2Name,
        wedding_date: new Date(formData.weddingDate),
        total_budget: formData.totalBudget,
        guest_count: formData.guestCount,
        location,
        wedding_style: formData.weddingStyles,
        priorities: formData.priorities,
        planning_stage: formData.planningStage,
        onboarding_completed: true,
      };

      await updateProfile(profileData);
      clearSignupData(); // Clear the temporary signup data
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to WeddingWise AI! 🎉
            </h1>
            <p className="text-gray-600">
              Let's get to know you and your wedding vision
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Tell us about your wedding
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner 1 Name
                  </label>
                  <input
                    type="text"
                    value={formData.partner1Name}
                    onChange={(e) => handleInputChange('partner1Name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner 2 Name
                  </label>
                  <input
                    type="text"
                    value={formData.partner2Name}
                    onChange={(e) => handleInputChange('partner2Name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Budget ($)
                  </label>
                  <input
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => handleInputChange('totalBudget', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="1000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Where's your wedding?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter state"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipcode}
                    onChange={(e) => handleInputChange('zipcode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter zip code"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Style & Priorities */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                What's your wedding style?
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select all that apply:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {weddingStyleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStyleToggle(option.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.weddingStyles.includes(option.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Planning Stage
                </label>
                <select
                  value={formData.planningStage}
                  onChange={(e) => handleInputChange('planningStage', e.target.value as PlanningStage)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {planningStageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Priorities */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                What matters most to you?
              </h2>
              <p className="text-gray-600 mb-6">
                Rate each category from 1 (least important) to 5 (most important)
              </p>
              
              <div className="space-y-4">
                {Object.entries(formData.priorities).map(([category, value]) => (
                  <div key={category} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {category.replace('_', ' ')}
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handlePriorityChange(category as keyof CategoryPriorities, rating)}
                          className={`w-8 h-8 rounded-full border-2 transition-colors ${
                            value >= rating
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
