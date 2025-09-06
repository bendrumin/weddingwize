import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      weddingDate,
      guestCount,
      budget,
      message,
      inquiryType = 'general'
    } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Check if vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name, contact')
      .eq('id', id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Create inquiry record
    const { data: inquiry, error: inquiryError } = await supabase
      .from('vendor_inquiries')
      .insert({
        vendor_id: id,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        wedding_date: weddingDate,
        guest_count: guestCount,
        budget: budget,
        message: message,
        inquiry_type: inquiryType,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (inquiryError) {
      console.error('Error creating inquiry:', inquiryError);
      return NextResponse.json(
        { error: 'Failed to send inquiry' },
        { status: 500 }
      );
    }

    // TODO: Send email notification to vendor
    // TODO: Send confirmation email to customer
    
    return NextResponse.json({
      success: true,
      message: 'Inquiry sent successfully! The vendor will contact you soon.',
      inquiryId: inquiry.id
    });

  } catch (error) {
    console.error('Error in vendor inquiry API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
