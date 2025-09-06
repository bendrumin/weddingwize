// Script to clear all vendors from the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearVendors() {
  console.log('🗑️  Clearing all vendors from database...');
  
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .not('id', 'is', null); // Delete all vendors

    if (error) {
      console.error('❌ Error clearing vendors:', error);
      return;
    }

    console.log('✅ All vendors cleared successfully');
    
    // Verify the database is empty
    const { data: remainingVendors, error: fetchError } = await supabase
      .from('vendors')
      .select('id')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error verifying clear:', fetchError);
      return;
    }

    console.log(`📊 Remaining vendors: ${remainingVendors?.length || 0}`);
    
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
