import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseKey: supabaseKey ? 'Set' : 'Missing',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic connection
    const { data, error } = await supabase
      .from('wedding_profiles')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      supabaseUrl: supabaseUrl.substring(0, 20) + '...',
      supabaseKey: supabaseKey.substring(0, 20) + '...',
      data: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
