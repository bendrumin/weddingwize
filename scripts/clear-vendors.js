// Script to clear all vendors from the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearVendors() {
  console.log('🗑️  Clearing all venue-related data from database...');
  
  try {
    // Clear venues table
    console.log('🗑️ Clearing venues table...');
    const { error: venuesError } = await supabase
      .from('venues')
      .delete()
      .not('id', 'is', null);

    if (venuesError) {
      console.error('❌ Error clearing venues:', venuesError);
    } else {
      console.log('✅ Venues table cleared');
    }

    // Clear venue_profiles table
    console.log('🗑️ Clearing venue_profiles table...');
    const { error: profilesError } = await supabase
      .from('venue_profiles')
      .delete()
      .not('id', 'is', null);

    if (profilesError) {
      console.error('❌ Error clearing venue_profiles:', profilesError);
    } else {
      console.log('✅ Venue_profiles table cleared');
    }

    // Clear vendor_inquiries table
    console.log('🗑️ Clearing vendor_inquiries table...');
    const { error: inquiriesError } = await supabase
      .from('vendor_inquiries')
      .delete()
      .not('id', 'is', null);

    if (inquiriesError) {
      console.error('❌ Error clearing vendor_inquiries:', inquiriesError);
    } else {
      console.log('✅ Vendor_inquiries table cleared');
    }

    // Clear scraping_logs table
    console.log('🗑️ Clearing scraping_logs table...');
    const { error: logsError } = await supabase
      .from('scraping_logs')
      .delete()
      .not('id', 'is', null);

    if (logsError) {
      console.error('❌ Error clearing scraping_logs:', logsError);
    } else {
      console.log('✅ Scraping_logs table cleared');
    }

    // Clear vendors table (original functionality)
    console.log('🗑️ Clearing vendors table...');
    const { error: vendorsError } = await supabase
      .from('vendors')
      .delete()
      .not('id', 'is', null);

    if (vendorsError) {
      console.error('❌ Error clearing vendors:', vendorsError);
    } else {
      console.log('✅ Vendors table cleared');
    }

    console.log('🎉 All venue-related tables cleared successfully!');
    console.log('💡 You can now run your scraper to populate with fresh real data');
    
  } catch (error) {
    console.error('❌ Error in clear script:', error);
  }
}

clearVendors()
  .then(() => {
    console.log('✅ Clear script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Clear script failed:', error);
    process.exit(1);
  });
