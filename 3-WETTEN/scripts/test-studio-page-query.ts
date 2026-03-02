import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testStudioPageQuery() {
  console.log('🔍 Testing Studio Page Workshop Query...\n');

  try {
    // Test 1: Simple workshops query
    console.log('Test 1: Simple workshops query (no joins)');
    const { data: simpleData, error: simpleError } = await supabase
      .from('workshops')
      .select('id, title, slug, status, world_id')
      .eq('status', 'live')
      .eq('world_id', 2)
      .limit(5);

    if (simpleError) {
      console.error('❌ Simple query failed:', simpleError);
    } else {
      console.log(`✅ Found ${simpleData?.length || 0} workshops`);
      simpleData?.forEach(w => console.log(`  - ${w.title} (${w.slug})`));
    }

    console.log('\n---\n');

    // Test 2: Workshops with editions (no instructor)
    console.log('Test 2: Workshops with editions (no instructor join)');
    const { data: editionsData, error: editionsError } = await supabase
      .from('workshops')
      .select(`
        id,
        title,
        slug,
        editions:workshop_editions(
          id,
          date,
          status,
          instructor_id,
          location_id
        )
      `)
      .eq('status', 'live')
      .eq('world_id', 2)
      .limit(5);

    if (editionsError) {
      console.error('❌ Editions query failed:', editionsError);
    } else {
      console.log(`✅ Found ${editionsData?.length || 0} workshops with editions`);
      editionsData?.forEach(w => {
        console.log(`  - ${w.title}: ${(w.editions as any[])?.length || 0} editions`);
      });
    }

    console.log('\n---\n');

    // Test 3: Full query with instructor (the problematic one)
    console.log('Test 3: Full query with instructor join');
    const { data: fullData, error: fullError } = await supabase
      .from('workshops')
      .select(`
        *,
        media:media_id(*),
        editions:workshop_editions(
          *,
          instructor:instructors!workshop_editions_instructor_id_instructors_id_fk(
            id, 
            name, 
            first_name, 
            last_name, 
            bio, 
            photo_id,
            photo:photo_id(*)
          ),
          location:locations(id, name, address, city, zip, country)
        )
      `)
      .eq('status', 'live')
      .eq('world_id', 2)
      .limit(5);

    if (fullError) {
      console.error('❌ Full query failed:', fullError);
      console.error('Error details:', JSON.stringify(fullError, null, 2));
    } else {
      console.log(`✅ Found ${fullData?.length || 0} workshops with full data`);
      fullData?.forEach(w => {
        console.log(`  - ${w.title}: ${(w.editions as any[])?.length || 0} editions`);
      });
    }

    console.log('\n---\n');

    // Test 4: Check if the FK name is correct
    console.log('Test 4: Testing alternative FK syntax');
    const { data: altData, error: altError } = await supabase
      .from('workshops')
      .select(`
        id,
        title,
        editions:workshop_editions(
          id,
          date,
          instructor:instructors(
            id,
            name,
            first_name,
            last_name
          )
        )
      `)
      .eq('status', 'live')
      .eq('world_id', 2)
      .limit(5);

    if (altError) {
      console.error('❌ Alternative query failed:', altError);
      console.error('Error details:', JSON.stringify(altError, null, 2));
    } else {
      console.log(`✅ Alternative query succeeded: ${altData?.length || 0} workshops`);
      altData?.forEach(w => {
        console.log(`  - ${w.title}`);
        (w.editions as any[])?.forEach(e => {
          console.log(`    Edition ${e.id}: Instructor = ${(e.instructor as any)?.name || 'N/A'}`);
        });
      });
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

testStudioPageQuery().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
