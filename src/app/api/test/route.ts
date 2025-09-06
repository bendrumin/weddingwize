import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🚀 Test API called');
    
    return NextResponse.json({
      success: true,
      message: 'Test API working',
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
