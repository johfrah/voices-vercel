import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 *  ADEMING (MEDITATIE) API
 * 
 * Doel: Ontsluiten van de meditatie-schatkist voor de app of portal.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
  : null;

function parseUserId(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getBackgroundMusic() {
  if (!supabase) return { data: null as any, error: { message: 'Supabase client unavailable' } as any };

  // Some environments still use `is_public`; prefer `is_active` and fallback.
  const primary = await supabase
    .from('ademing_background_music')
    .select('*')
    .eq('is_active', true);

  if (!primary.error) return primary;

  if (primary.error.message?.toLowerCase().includes('is_active')) {
    return supabase
      .from('ademing_background_music')
      .select('*')
      .eq('is_public', true);
  }

  return primary;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const action = searchParams.get('action') || 'tracks';
  const slug = searchParams.get('slug');

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client unavailable' }, { status: 503 });
  }

  try {
    if (action === 'tracks') {
      if (slug) {
        const { data: track, error } = await supabase
          .from('ademing_tracks')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (error) throw error;
        return NextResponse.json(track);
      }
      const { data: tracks, error } = await supabase
        .from('ademing_tracks')
        .select('*')
        .eq('is_public', true)
        .order('id', { ascending: true });
      if (error) throw error;
      return NextResponse.json(tracks);
    }

    if (action === 'series') {
      if (slug) {
        const { data: series, error: seriesError } = await supabase
          .from('ademing_series')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (seriesError) throw seriesError;
        if (!series) return NextResponse.json(null, { status: 404 });

        const { data: tracks, error: tracksError } = await supabase
          .from('ademing_tracks')
          .select('*')
          .eq('series_id', series.id)
          .order('series_order', { ascending: true });
        if (tracksError) throw tracksError;

        return NextResponse.json({ ...series, tracks: tracks || [] });
      }
      const { data: seriesList, error } = await supabase
        .from('ademing_series')
        .select('*')
        .eq('is_public', true)
        .order('id', { ascending: true });
      if (error) throw error;
      return NextResponse.json(seriesList);
    }

    if (action === 'makers') {
      if (slug) {
        const { data: maker, error } = await supabase
          .from('ademing_makers')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (error) throw error;
        return NextResponse.json(maker);
      }
      const { data: makers, error } = await supabase
        .from('ademing_makers')
        .select('*')
        .eq('is_public', true)
        .order('id', { ascending: true });
      if (error) throw error;
      return NextResponse.json(makers);
    }

    if (action === 'background-music') {
      const { data: music, error } = await getBackgroundMusic();
      if (error) throw error;
      return NextResponse.json(music);
    }

    if (action === 'stats') {
      const parsedUserId = parseUserId(userId);
      if (parsedUserId == null) {
        return NextResponse.json({ error: 'Invalid or missing userId' }, { status: 400 });
      }
      const { data: stats, error } = await supabase
        .from('ademing_stats')
        .select('*')
        .eq('user_id', parsedUserId)
        .maybeSingle();
      if (error) throw error;

      if (!stats) {
        return NextResponse.json({ streakDays: 0, totalListenSeconds: 0 });
      }

      return NextResponse.json({
        ...stats,
        streakDays: stats.streak_days ?? stats.streakDays ?? 0,
        totalListenSeconds: stats.total_listen_seconds ?? stats.totalListenSeconds ?? 0
      });
    }

    if (action === 'reflections') {
      const parsedUserId = parseUserId(userId);
      if (parsedUserId == null) {
        return NextResponse.json({ error: 'Invalid or missing userId' }, { status: 400 });
      }
      const { data: reflections, error } = await supabase
        .from('ademing_reflections')
        .select()
        .eq('user_id', parsedUserId)
        .order('id', { ascending: false });
      if (error) throw error;
      return NextResponse.json(reflections);
    }

    return NextResponse.json({ error: 'Invalid action or missing userId' }, { status: 400 });
  } catch (error) {
    console.error('[Ademing API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { userId, intention, reflection } = body;
    const parsedUserId = parseUserId(String(userId ?? ''));

    if (parsedUserId == null) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    const { data: newReflection, error } = await supabase
      .from('ademing_reflections')
      .insert({
        user_id: parsedUserId,
        intention,
        reflection
      })
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json(newReflection, { status: 201 });
  } catch (error) {
    console.error('[Ademing API Error][POST]:', error);
    return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
  }
}
