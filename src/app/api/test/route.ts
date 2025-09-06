import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Test API called');
    
    return NextResponse.json({
      success: true,
      message: 'Test API working',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
