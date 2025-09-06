'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Crown, 
  Sparkles, 
  Check, 
  Star,
  Users,
  Calendar,
  Target,
  Zap,
  Shield,
  Heart
} from 'lucide-react';

export default function UpgradePage() {
  const { user, profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('premium');

  const features = [
    {
      category: 'Vendor Marketplace',
      items: [
        'Unlimited vendor matches',
        'AI-powered compatibility scoring',
        'Direct vendor contact',
        'Portfolio galleries',
        'Verified vendor badges'
      ]
    },
    {
      category: 'Advanced Analytics',
      items: [
        'Market comparison insights',
        'Budget optimization reports',
        'Spending trend analysis',
        'Cost-saving recommendations',
        'ROI tracking'
      ]
    },
    {
      category: 'Timeline Management',
      items: [
        'Smart task generation',
        'Dependency tracking',
        'Vendor booking alerts',
        'Progress monitoring',
        'Custom timeline creation'
      ]
    },
    {
      category: 'Guest Management',
      items: [
        'RSVP tracking',
        'Seating optimization',
        'Dietary restrictions',
        'Communication tools',
        'Gift tracking'
      ]
    }
  ];

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Basic budget tracker',
        '5 vendor matches per category',
        'Simple timeline',
        'Up to 50 guests',
        'Email support'
      ],
      limitations: [
        'Limited vendor matches',
        'Basic analytics only',
        'No advanced features'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$149',
      period: 'month',
      description: 'Most popular for engaged couples',
      features: [
        'Unlimited vendor matches',
        'AI-powered recommendations',
        'Advanced budget analytics',
        'Smart timeline management',
        'Guest management suite',
        'Priority support',
        'Vendor lead tracking'
      ],
      limitations: [],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$299',
      period: 'month',
      description: 'For wedding planners and venues',
      features: [
        'Everything in Premium',
        'Multi-wedding management',
        'White-label options',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced reporting'
      ],
      limitations: [],
      popular: false
    }
  ];

  if (!user || !profile) {
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
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-purple-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Upgrade to Premium</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full power of AI-driven wedding planning with unlimited vendor matches, 
            advanced analytics, and personalized recommendations.
          </p>
        </div>

        {/* Current Plan Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
              <p className="text-gray-600">
                {profile.subscription_tier === 'premium' 
                  ? 'You\'re already on Premium! 🎉' 
                  : 'You\'re currently on the Free plan'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {profile.subscription_tier === 'premium' ? 'Premium' : 'Free'}
              </div>
              <div className="text-sm text-gray-500">
                {profile.subscription_tier === 'premium' ? '$149/month' : '$0/month'}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg p-6 relative ${
                plan.popular ? 'ring-2 ring-purple-500 transform scale-105' : ''
              } ${selectedPlan === plan.id ? 'ring-2 ring-pink-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">{plan.price}</div>
                <div className="text-gray-500">per {plan.period}</div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Limitations:</h4>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="text-sm text-gray-500">• {limitation}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  plan.id === 'free'
                    ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
                disabled={plan.id === 'free'}
              >
                {plan.id === 'free' ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Everything You Get with Premium
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((category, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {category.category === 'Vendor Marketplace' && <Users className="h-5 w-5 mr-2 text-purple-500" />}
                  {category.category === 'Advanced Analytics' && <Target className="h-5 w-5 mr-2 text-blue-500" />}
                  {category.category === 'Timeline Management' && <Calendar className="h-5 w-5 mr-2 text-green-500" />}
                  {category.category === 'Guest Management' && <Heart className="h-5 w-5 mr-2 text-pink-500" />}
                  {category.category}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 text-center text-white">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-bold">Ready to Upgrade?</h2>
          </div>
          <p className="text-xl mb-6 text-purple-100">
            Join thousands of couples who have already discovered the power of AI-driven wedding planning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-purple-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              Start Premium Trial - 7 Days Free
            </button>
            <div className="text-purple-100 text-sm">
              Cancel anytime • No commitment
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
