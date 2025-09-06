// app/admin/scraping/page.tsx
// Admin dashboard to monitor and control scraping
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

interface ScrapingJob {
  id: string;
  job_type: string;
  target_location: {
    city: string;
    state: string;
  };
  status: string;
  vendors_found: number;
  vendors_updated: number;
  errors_encountered: string[];
  started_at: string;
  completed_at: string;
  next_run_at: string;
}

interface ScrapingProgress {
  isRunning: boolean;
  currentPage: number;
  totalPages: number;
  venuesFound: number;
  venuesSaved: number;
  currentLocation: string;
  status: string;
  error?: string;
}

export default function ScrapingDashboard() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [maxVenues, setMaxVenues] = useState(50);
  const [maxPages, setMaxPages] = useState(10);
  const [progress, setProgress] = useState<ScrapingProgress | null>(null);
  const [results, setResults] = useState<{
    success: boolean;
    message: string;
    venuesFound: number;
    location: string;
    timestamp: string;
    sampleVenues?: Array<{
      name: string;
      location: string;
      rating: number;
      reviewCount: number;
      venueType: string;
    }>;
    suggestions?: string[];
  } | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setJobs(data);
  }, [supabase]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const triggerScraping = async (location: string) => {
    setLoading(true);
    setProgress({
      isRunning: true,
      currentPage: 0,
      totalPages: maxPages,
      venuesFound: 0,
      venuesSaved: 0,
      currentLocation: location,
      status: 'Starting scraper...'
    });
    setResults(null);

    try {
      const response = await fetch('/api/scraping/venues', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret-key-123'}`
        },
        body: JSON.stringify({
          location,
          maxVenues,
          maxPages,
          action: 'scrape_location'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(data);
        setProgress(prev => prev ? { ...prev, isRunning: false, status: 'Completed successfully' } : null);
        await fetchJobs();
        setSelectedLocation('');
        setCustomLocation('');
      } else {
        setProgress(prev => prev ? { ...prev, isRunning: false, status: 'Failed', error: data.error } : null);
      }
    } catch (error) {
      console.error('Failed to trigger scraping:', error);
      setProgress(prev => prev ? { ...prev, isRunning: false, status: 'Failed', error: 'Network error' } : null);
    } finally {
      setLoading(false);
    }
  };

  const popularLocations = [
    // Major Cities
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA',
    'Austin, TX',
    'Jacksonville, FL',
    'Fort Worth, TX',
    'Columbus, OH',
    'Charlotte, NC',
    'San Francisco, CA',
    'Indianapolis, IN',
    'Seattle, WA',
    'Denver, CO',
    'Washington, DC',
    'Boston, MA',
    'El Paso, TX',
    'Nashville, TN',
    'Detroit, MI',
    'Oklahoma City, OK',
    'Portland, OR',
    'Las Vegas, NV',
    'Memphis, TN',
    'Louisville, KY',
    'Baltimore, MD',
    'Milwaukee, WI',
    'Albuquerque, NM',
    'Tucson, AZ',
    'Fresno, CA',
    'Sacramento, CA',
    'Mesa, AZ',
    'Kansas City, MO',
    'Atlanta, GA',
    'Long Beach, CA',
    'Colorado Springs, CO',
    'Raleigh, NC',
    'Miami, FL',
    'Virginia Beach, VA',
    'Omaha, NE',
    'Oakland, CA',
    'Minneapolis, MN',
    'Tulsa, OK',
    'Arlington, TX',
    'Tampa, FL',
    'New Orleans, LA',
    // States
    'California',
    'Texas',
    'Florida',
    'New York',
    'Pennsylvania',
    'Illinois',
    'Ohio',
    'Georgia',
    'North Carolina',
    'Michigan',
    'New Jersey',
    'Virginia',
    'Washington',
    'Arizona',
    'Massachusetts',
    'Tennessee',
    'Indiana',
    'Missouri',
    'Maryland',
    'Wisconsin',
    'Colorado',
    'Minnesota',
    'South Carolina',
    'Alabama',
    'Louisiana',
    'Kentucky',
    'Oregon',
    'Oklahoma',
    'Connecticut',
    'Utah',
    'Iowa',
    'Nevada',
    'Arkansas',
    'Mississippi',
    'Kansas',
    'New Mexico',
    'Nebraska',
    'West Virginia',
    'Idaho',
    'Hawaii',
    'New Hampshire',
    'Maine',
    'Montana',
    'Rhode Island',
    'Delaware',
    'South Dakota',
    'North Dakota',
    'Alaska',
    'Vermont',
    'Wyoming'
  ];

  const getLocationDisplay = () => {
    if (selectedLocation) return selectedLocation;
    if (customLocation) return customLocation;
    return '';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Venue Scraping Dashboard</h1>
      
      {/* Manual Trigger Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Manual Scraping Trigger</h2>
        
        {/* Location Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Popular Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCustomLocation(''); // Clear custom location when selecting popular one
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Choose a popular location...</option>
              {popularLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Custom Location
            </label>
            <input
              type="text"
              value={customLocation}
              onChange={(e) => {
                setCustomLocation(e.target.value);
                setSelectedLocation(''); // Clear popular location when typing custom
              }}
              placeholder="e.g., Minneapolis, MN or Minnesota"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Scraping Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Venues to Scrape
            </label>
            <input
              type="number"
              value={maxVenues}
              onChange={(e) => setMaxVenues(parseInt(e.target.value) || 50)}
              min="1"
              max="1000"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">Limit the number of venues to scrape (1-1000)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Pages to Scrape
            </label>
            <input
              type="number"
              value={maxPages}
              onChange={(e) => setMaxPages(parseInt(e.target.value) || 10)}
              min="1"
              max="50"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">Limit the number of pages to scrape (1-50)</p>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              <strong>Selected Location:</strong> {getLocationDisplay() || 'None selected'}
            </p>
            <p className="text-sm text-gray-500">
              Will scrape up to {maxVenues} venues across {maxPages} pages
            </p>
          </div>
          <button
            onClick={() => triggerScraping(getLocationDisplay())}
            disabled={!getLocationDisplay() || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Start Scraping'}
          </button>
        </div>
      </div>

      {/* Progress Section */}
      {progress && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Scraping Progress</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                progress.isRunning 
                  ? 'bg-yellow-100 text-yellow-800'
                  : progress.error
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {progress.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Location:</span>
              <span className="text-sm text-gray-900">{progress.currentLocation}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress:</span>
              <span className="text-sm text-gray-900">
                Page {progress.currentPage} of {progress.totalPages}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Venues Found:</span>
              <span className="text-sm text-gray-900">{progress.venuesFound}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Venues Saved:</span>
              <span className="text-sm text-gray-900">{progress.venuesSaved}</span>
            </div>
            
            {progress.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {progress.error}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Scraping Results</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Success</h3>
                <p className="text-2xl font-bold text-blue-600">{results.success ? 'Yes' : 'No'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Venues Found</h3>
                <p className="text-2xl font-bold text-green-600">{results.venuesFound || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800">Location</h3>
                <p className="text-sm font-bold text-purple-600">{results.location}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-800">Timestamp</h3>
                <p className="text-sm font-bold text-gray-600">
                  {new Date(results.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            {results.message && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-800">{results.message}</p>
              </div>
            )}
            
            {results.sampleVenues && results.sampleVenues.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Sample Venues Found</h3>
                <div className="space-y-2">
                  {results.sampleVenues.slice(0, 5).map((venue, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{venue.name}</h4>
                          <p className="text-sm text-gray-600">{venue.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ⭐ {venue.rating} ({venue.reviewCount} reviews)
                          </p>
                          <p className="text-xs text-gray-500">{venue.venueType}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.suggestions && results.suggestions.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Suggestions:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {results.suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Status Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Scraping Jobs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venues Found
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venues Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Errors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.target_location.city}, {job.target_location.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'running'
                        ? 'bg-yellow-100 text-yellow-800'
                        : job.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.vendors_found || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.vendors_updated || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.started_at ? new Date(job.started_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.started_at && job.completed_at 
                      ? `${Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000 / 60)}m`
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.errors_encountered?.length || 0}
                    {job.errors_encountered?.length > 0 && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-red-600 hover:text-red-800">
                          View Errors
                        </summary>
                        <div className="mt-2 text-xs bg-red-50 p-2 rounded max-w-xs">
                          {job.errors_encountered.map((error, i) => (
                            <div key={i} className="mb-1">{error}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Jobs</h3>
          <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
          <p className="text-3xl font-bold text-green-600">
            {jobs.filter(job => job.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Venues</h3>
          <p className="text-3xl font-bold text-purple-600">
            {jobs.reduce((sum, job) => sum + (job.vendors_found || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
          <p className="text-3xl font-bold text-blue-600">
            {jobs.length > 0 
              ? Math.round((jobs.filter(job => job.status === 'completed').length / jobs.length) * 100)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
