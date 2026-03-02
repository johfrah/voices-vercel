import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * 🛡️ CHRIS-PROTOCOL: SUPABASE SDK DEMO UPDATE (v2.14.506)
 * 
 * We use the Supabase SDK directly for maximum stability on Vercel.
 * This bypasses Drizzle schema resolution issues (Symbol(drizzle:Columns)).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  // 🛡️ CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid demo ID' }, { status: 400 });
    }

    // Initialize Supabase Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updateData: any = {};
    if (body.title !== undefined) updateData.name = body.title;
    if (body.category !== undefined) updateData.type = body.category;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;

    const { data, error } = await supabase
      .from('actor_demos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(' [SDK-DEMO-PATCH] Update failed:', error);
      throw new Error(`Demo update failed: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, demo: data });
  } catch (error: any) {
    console.error(' [SDK-DEMO-PATCH] CRASH:', error);
    return NextResponse.json({ error: 'Failed to update demo', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  // 🛡️ CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid demo ID' }, { status: 400 });
    }

    // Initialize Supabase Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('actor_demos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(' [SDK-DEMO-DELETE] Delete failed:', error);
      throw new Error(`Demo delete failed: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' [SDK-DEMO-DELETE] CRASH:', error);
    return NextResponse.json({ error: 'Failed to delete demo', details: error.message }, { status: 500 });
  }
}
