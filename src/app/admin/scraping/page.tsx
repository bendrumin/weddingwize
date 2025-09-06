// app/admin/scraping/page.tsx
// Admin dashboard to monitor and control scraping
'use client';

import { useState, useEffect } from 'react';
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

export default function ScrapingDashboard() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setJobs(data);
  };

  const triggerScraping = async (location: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/scraping/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: [location],
          priority: 'high'
        })
      });

      if (response.ok) {
        await fetchJobs();
        setSelectedLocation('');
      }
    } catch (error) {
      console.error('Failed to trigger scraping:', error);
    } finally {
      setLoading(false);
    }
  };

  const popularLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Austin, TX',
    'Miami, FL',
    'San Francisco, CA',
    'Seattle, WA',
    'Denver, CO',
    'Nashville, TN',
    'Atlanta, GA'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Venue Scraping Dashboard</h1>
      
      {/* Manual Trigger Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Manual Scraping Trigger</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Choose a location...</option>
              {popularLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => triggerScraping(selectedLocation)}
            disabled={!selectedLocation || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Scraping'}
          </button>
        </div>
      </div>

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
