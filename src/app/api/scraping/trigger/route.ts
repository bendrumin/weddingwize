// app/api/scraping/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Manual trigger for admins to start scraping jobs
export async function POST(request: NextRequest) {
  try {
    // Add authentication check here for admin users
    const body = await request.json();
    const { locations, priority } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Queue scraping jobs
    const jobs = locations.map((location: string) => ({
      job_type: 'venues',
      target_location: {
        city: location.split(',')[0].trim(),
        state: location.split(',')[1]?.trim()
      },
      status: 'pending',
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('scraping_jobs')
      .insert(jobs)
      .select();

    if (error) throw error;

    // Trigger actual scraping (you might want to use a queue system like Bull/Redis for production)
    const scrapePromises = locations.map(async (location: string) => {
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/scraping/venues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`
          },
          body: JSON.stringify({
            action: 'scrape_location',
            location
          })
        });
        return response.json();
      } catch (error) {
        console.error(`Failed to trigger scraping for ${location}:`, error);
        return { error: `Failed to scrape ${location}` };
      }
    });

    // Don't await all promises if you want to return quickly
    if (priority === 'high') {
      await Promise.all(scrapePromises);
    } else {
      // Fire and forget for low priority
      Promise.all(scrapePromises).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      message: `Queued ${locations.length} scraping jobs`,
      jobs: data
    });

  } catch (error) {
    console.error('Error triggering scraping jobs:', error);
    return NextResponse.json({
      error: 'Failed to trigger scraping jobs'
    }, { status: 500 });
  }
}
