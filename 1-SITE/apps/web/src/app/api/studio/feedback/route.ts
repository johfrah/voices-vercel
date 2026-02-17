import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workshop_name, ratings, text_most_valuable, text_improvement, text_recommendation, user_email } = body;

    const timestamp = new Date().getTime();
    const slug = `internal-feedback-new-${timestamp}`;
    const title = `New Feedback: ${workshop_name} (${new Date().toLocaleDateString()})`;

    // Store the full detailed feedback internally in system_knowledge (PRIVATE)
    const { error: feedbackError } = await supabase
      .from('system_knowledge')
      .insert({
        slug,
        title,
        category: 'Internal Learning / Feedback',
        content: JSON.stringify({
          workshop: workshop_name,
          ratings,
          details: {
            most_valuable: text_most_valuable,
            improvement: text_improvement,
            recommendation: text_recommendation
          },
          source: 'headless_feedback_form'
        }, null, 2),
        metadata: {
          type: 'workshop_feedback',
          workshop_name: workshop_name,
          source: 'headless_feedback_form',
          participant_email: user_email || null
        },
        last_synced_at: new Date().toISOString()
      });

    if (feedbackError) throw feedbackError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(' Feedback submission failed:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
