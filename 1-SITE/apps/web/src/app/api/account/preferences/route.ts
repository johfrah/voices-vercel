import { createClient } from '@/utils/supabase/server';
import { db } from '@voices/database';
import { users } from '@voices/database/src/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * API: Update User Preferences
 * 
 * Doel: Slaat gebruikersvoorkeuren (zoals taal) op in de database voor 'Intelligence' en 'Stickiness'.
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences } = await request.json();

    if (!preferences) {
      return NextResponse.json({ error: 'Missing preferences' }, { status: 400 });
    }

    // Haal huidige preferences op
    const [existingUser] = await db.select({ preferences: users.preferences })
      .from(users)
      .where(eq(users.email, user.email!))
      .limit(1)
      .catch((err) => {
        console.error(`[preferences] DB Select Error for ${user.email}:`, err);
        return [];
      });

    const currentPreferences = (existingUser?.preferences as any) || {};
    const updatedPreferences = { ...currentPreferences, ...preferences };

    // Update in DB
    await db.update(users)
      .set({ 
        preferences: updatedPreferences,
        updatedAt: new Date()
      })
      .where(eq(users.email, user.email!))
      .catch((err) => {
        console.error(`[preferences] DB Update Error for ${user.email}:`, err);
      });

    return NextResponse.json({ success: true, preferences: updatedPreferences });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
