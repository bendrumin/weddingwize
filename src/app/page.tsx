'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Users, DollarSign, Calendar, MapPin } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-2xl font-bold text-gray-900">WeddingWise AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-pink-500 mr-3" />
            <span className="text-lg font-semibold text-pink-600">AI-Powered Wedding Planning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Plan Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              {" "}Wedding{" "}
            </span>
            with AI
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The most intelligent wedding planning platform that combines real-time vendor data 
            with AI optimization to create your dream wedding within budget. Perfect for all couples.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="bg-pink-500 text-white px-8 py-4 rounded-full hover:bg-pink-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Planning Free
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900 font-medium text-lg"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Your Perfect Wedding
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform handles the complexity so you can focus on what matters most.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl">
              <div className="bg-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Budget Optimizer</h3>
              <p className="text-gray-600 leading-relaxed">
                AI analyzes real market data to optimize your budget allocation across all wedding categories, 
                ensuring you get maximum value for every dollar spent.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Intelligent Vendor Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI matches you with the perfect vendors based on your style, budget, location, 
                and preferences using real-time scraped data from thousands of vendors.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dynamic Timeline Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Self-adjusting timeline that adapts to real-world changes, handles dependencies, 
                and prevents vendor booking conflicts automatically.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Vendor Data</h3>
              <p className="text-gray-600 leading-relaxed">
                Access to constantly updated vendor information, pricing, availability, 
                and reviews scraped from multiple sources across the web.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl">
              <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Guest Management Suite</h3>
              <p className="text-gray-600 leading-relaxed">
                Intelligent guest management with RSVP tracking, dietary restrictions, 
                seating optimization, and automated communication.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl">
              <div className="bg-indigo-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized recommendations, cost-saving tips, and optimization suggestions 
                powered by machine learning and real wedding data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Plan Your Dream Wedding?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of couples who have already discovered the power of AI-driven wedding planning. 
            Inclusive and welcoming to all.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-pink-500 px-8 py-4 rounded-full hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">WeddingWise AI</span>
          </div>
          <p className="text-gray-400">
            © 2024 WeddingWise AI. All rights reserved. Made with ❤️ for couples everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
