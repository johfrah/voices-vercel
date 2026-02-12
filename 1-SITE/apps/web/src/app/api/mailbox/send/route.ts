import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Admin Check
  if (!user || user.email !== 'johfrah@voices.be') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Call Email Service
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${emailServiceUrl}/api/v2/emails/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        template: 'raw',
        context: {
          content: body,
          skip_approval: true // Admin sends directly
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email via service');
    }

    const result = await response.json();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Mailbox API] Error sending email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
