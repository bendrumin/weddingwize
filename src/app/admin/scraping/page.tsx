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

interface ComprehensiveProgress {
  isRunning: boolean;
  currentBatch: string;
  nextStartIndex: number | null;
  isComplete: boolean;
  totalStates: number;
  venuesScraped: number;
  statesProcessed: number;
  venuesPerState: number;
  status: string;
  error?: string;
}

export default function ScrapingDashboard() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [comprehensiveProgress, setComprehensiveProgress] = useState<ComprehensiveProgress | null>(null);
  const [comprehensiveLoading, setComprehensiveLoading] = useState(false);
  const [actualVenueCount, setActualVenueCount] = useState<number>(0);
  const [comprehensiveResults, setComprehensiveResults] = useState<{
    success: boolean;
    message: string;
    venuesScraped: number;
    batchInfo: {
      currentBatch: string;
      nextStartIndex: number | null;
      isComplete: boolean;
      totalStates: number;
    } | null;
    summary: {
      statesProcessed: number;
      venuesPerState: number;
      totalVenues: number;
    } | null;
    timestamp: string;
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

  const fetchActualVenueCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'venue');

      if (error) {
        console.error('Error fetching venue count:', error);
      } else {
        setActualVenueCount(count || 0);
        console.log('Actual venue count:', count);
      }
    } catch (error) {
      console.error('Error fetching venue count:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchJobs();
    fetchActualVenueCount();
  }, [fetchJobs, fetchActualVenueCount]);

  const triggerComprehensiveScraping = async (startIndex: number = 0, maxStates: number = 10) => {
    setComprehensiveLoading(true);
    setComprehensiveProgress({
      isRunning: true,
      currentBatch: `${startIndex + 1}-${startIndex + maxStates}`,
      nextStartIndex: null,
      isComplete: false,
      totalStates: 50,
      venuesScraped: 0,
      statesProcessed: 0,
      venuesPerState: 0,
      status: 'Starting comprehensive scraping...'
    });
    setComprehensiveResults(null);

    try {
      const response = await fetch('/api/scraping/comprehensive', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret-key-123'}`
        },
        body: JSON.stringify({
          startIndex,
          maxStates
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setComprehensiveProgress({
          isRunning: false,
          currentBatch: data.batchInfo?.currentBatch || 'Unknown',
          nextStartIndex: data.batchInfo?.nextStartIndex || null,
          isComplete: data.batchInfo?.isComplete || false,
          totalStates: 50,
          venuesScraped: data.venuesScraped || 0,
          statesProcessed: data.summary?.statesProcessed || 0,
          venuesPerState: data.summary?.venuesPerState || 0,
          status: data.batchInfo?.isComplete ? 'All states completed!' : 'Batch completed successfully'
        });
        setComprehensiveResults({
          success: true,
          message: data.message || 'Comprehensive scraping completed successfully',
          venuesScraped: data.venuesScraped || 0,
          batchInfo: data.batchInfo,
          summary: data.summary,
          timestamp: new Date().toISOString()
        });
        
        // Refresh venue count after scraping
        await fetchActualVenueCount();
      } else {
        setComprehensiveProgress({
          isRunning: false,
          currentBatch: 'Unknown',
          nextStartIndex: null,
          isComplete: false,
          totalStates: 50,
          venuesScraped: 0,
          statesProcessed: 0,
          venuesPerState: 0,
          status: 'Failed',
          error: data.error || 'Unknown error'
        });
        setComprehensiveResults({
          success: false,
          message: data.error || 'Comprehensive scraping failed',
          venuesScraped: 0,
          batchInfo: null,
          summary: null,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to trigger comprehensive scraping:', error);
      setComprehensiveProgress({
        isRunning: false,
        currentBatch: 'Unknown',
        nextStartIndex: null,
        isComplete: false,
        totalStates: 50,
        venuesScraped: 0,
        statesProcessed: 0,
        venuesPerState: 0,
        status: 'Failed',
        error: 'Network error'
      });
    } finally {
      setComprehensiveLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Venue Scraping Dashboard</h1>
      
      {/* Comprehensive Scraping Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Comprehensive 50-State Scraping</h2>
        <p className="text-gray-600 mb-6">
          Scrape venues from all 50 US states in batches. This will process 10 states per run to stay within timeout limits.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Index (0-49)
            </label>
            <input
              id="startIndex"
              type="number"
              min="0"
              max="49"
              defaultValue="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">Which state to start from (0 = Alabama, 49 = Wyoming)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max States per Run
            </label>
            <input
              id="maxStates"
              type="number"
              min="1"
              max="50"
              defaultValue="10"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">How many states to process in this run</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => {
              const startIndex = parseInt((document.getElementById('startIndex') as HTMLInputElement)?.value || '0');
              const maxStates = parseInt((document.getElementById('maxStates') as HTMLInputElement)?.value || '10');
              triggerComprehensiveScraping(startIndex, maxStates);
            }}
            disabled={comprehensiveLoading}
            className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {comprehensiveLoading ? 'Starting...' : 'Start Comprehensive Scraping'}
          </button>
        </div>
      </div>

      {/* Comprehensive Progress Section */}
      {comprehensiveProgress && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Comprehensive Scraping Progress</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                comprehensiveProgress.isRunning ? 'bg-blue-100 text-blue-800' : 
                comprehensiveProgress.status === 'All states completed!' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {comprehensiveProgress.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Batch</span>
              <span className="text-sm text-gray-600">{comprehensiveProgress.currentBatch}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">States Processed</span>
              <span className="text-sm text-gray-600">{comprehensiveProgress.statesProcessed} / {comprehensiveProgress.totalStates}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Venues Scraped</span>
              <span className="text-sm text-gray-600">{comprehensiveProgress.venuesScraped}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Venues per State</span>
              <span className="text-sm text-gray-600">{comprehensiveProgress.venuesPerState}</span>
            </div>
            
            {comprehensiveProgress.nextStartIndex !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Next Start Index</span>
                <span className="text-sm text-gray-600">{comprehensiveProgress.nextStartIndex}</span>
              </div>
            )}
            
            {comprehensiveProgress.isRunning && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(comprehensiveProgress.statesProcessed / comprehensiveProgress.totalStates) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comprehensive Results Section */}
      {comprehensiveResults && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Comprehensive Scraping Results</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${
                  comprehensiveResults.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {comprehensiveResults.success ? 'Success' : 'Failed'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Venues Scraped</p>
                <p className="text-lg font-semibold text-blue-600">{comprehensiveResults.venuesScraped}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">States Processed</p>
                <p className="text-lg font-semibold text-purple-600">{comprehensiveResults.summary?.statesProcessed || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="text-sm text-gray-600">{new Date(comprehensiveResults.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-700">{comprehensiveResults.message}</p>
            </div>
            
            {comprehensiveResults.batchInfo && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Batch Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Current Batch</p>
                    <p className="text-sm font-semibold text-gray-900">{comprehensiveResults.batchInfo.currentBatch}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Next Start Index</p>
                    <p className="text-sm font-semibold text-gray-900">{comprehensiveResults.batchInfo.nextStartIndex || 'Complete'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Is Complete</p>
                    <p className="text-sm font-semibold text-gray-900">{comprehensiveResults.batchInfo.isComplete ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total States</p>
                    <p className="text-sm font-semibold text-gray-900">{comprehensiveResults.batchInfo.totalStates}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Total Venues in DB</h3>
            <button
              onClick={fetchActualVenueCount}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Refresh
            </button>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {actualVenueCount}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Actual venues in database
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