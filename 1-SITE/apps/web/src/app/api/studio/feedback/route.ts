import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workshop_name, ratings, text_most_valuable, text_improvement, text_recommendation } = body;

    // 1. Store the full detailed feedback internally
    const { error: feedbackError } = await supabase
      .from('studio_feedback')
      .insert({
        content: JSON.stringify({
          workshop: workshop_name,
          ratings,
          details: {
            most_valuable: text_most_valuable,
            improvement: text_improvement,
            recommendation: text_recommendation
          }
        }),
        type: 'text',
        created_at: new Date().toISOString()
      });

    if (feedbackError) throw feedbackError;

    // 2. If it's a high rating, we could optionally trigger an admin notification
    // (Logic for Mat/Anna to be added here later)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Feedback submission failed:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
