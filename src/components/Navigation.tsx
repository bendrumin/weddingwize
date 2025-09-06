'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  Crown,
  Bell
} from 'lucide-react';

export default function Navigation() {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Don't show navigation on loading or for unauthenticated users on home page
  if (loading) {
    return null;
  }

  // Show minimal navigation for unauthenticated users
  if (!user) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">WeddingWise AI</span>
              </Link>
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
        </div>
      </nav>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Budget', href: '/budget', icon: '💰', badge: 'AI' },
    { name: 'Vendors', href: '/vendors', icon: '🏪', badge: 'Premium' },
    { name: 'Timeline', href: '/timeline', icon: '📅', comingSoon: true },
    { name: 'Guests', href: '/guests', icon: '👥', comingSoon: true },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">WeddingWise AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.comingSoon ? '#' : item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.comingSoon
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                }`}
                onClick={item.comingSoon ? (e) => e.preventDefault() : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.badge === 'AI' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.comingSoon && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-pink-500 rounded-full"></span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.partner1_name && profile?.partner2_name 
                      ? `${profile.partner1_name} & ${profile.partner2_name}`
                      : user?.email?.split('@')[0]
                    }
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    {profile?.subscription_tier === 'premium' ? (
                      <>
                        <Crown className="h-3 w-3 mr-1 text-purple-500" />
                        Premium
                      </>
                    ) : (
                      'Free Plan'
                    )}
                  </div>
                </div>
              </button>

              {/* Profile dropdown menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {profile?.partner1_name && profile?.partner2_name 
                        ? `${profile.partner1_name} & ${profile.partner2_name}`
                        : user?.email
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile?.subscription_tier === 'premium' ? 'Premium Plan' : 'Free Plan'}
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Account Settings
                  </Link>

                  {profile?.subscription_tier === 'free' && (
                    <Link
                      href="/upgrade"
                      className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Sparkles className="h-4 w-4 mr-3" />
                      Upgrade to Premium
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.comingSoon ? '#' : item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    item.comingSoon
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (item.comingSoon) {
                      event?.preventDefault();
                    }
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.badge === 'AI' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.comingSoon && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      Soon
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
