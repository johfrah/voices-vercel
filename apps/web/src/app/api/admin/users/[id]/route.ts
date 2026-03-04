import { db, users, ordersV2, systemEvents, visitors, utmTouchpoints, courseProgress, workshopInterest, courses, workshops, workshopEditions } from '@/lib/system/voices-config';
import { desc, eq, sql, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN USER DETAIL (2026)
 *  The Deep Dive into Customer DNA.
 */

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const userId = parseInt(params.id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    // 1. Fetch Core User Profile
    const userProfile = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!userProfile.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userProfile[0];

    // 2. Fetch Financial DNA (Orders)
    const userOrders = await db.select().from(ordersV2)
      .where(eq(ordersV2.userId, userId))
      .orderBy(desc(ordersV2.createdAt));

    const totalSpent = userOrders.reduce((sum: number, order: any) => sum + parseFloat(order.amountNet || '0'), 0);
    const averageOrderValue = userOrders.length > 0 ? totalSpent / userOrders.length : 0;

    // 3. Fetch Activity Timeline (System Events)
    const activityLog = await db.select().from(systemEvents)
      .where(sql`details->>'user_id' = ${userId.toString()}`)
      .orderBy(desc(systemEvents.createdAt))
      .limit(20);

    // 4. Fetch Marketing Insights (UTM & Visitors)
    const marketingTouchpoints = await db.select().from(utmTouchpoints)
      .where(eq(utmTouchpoints.user_id, userId))
      .orderBy(desc(utmTouchpoints.createdAt));

    const visitorData = await db.select().from(visitors)
      .where(eq(visitors.user_id, userId))
      .orderBy(desc(visitors.lastVisitAt))
      .limit(1);

    // 5. Fetch Academy Progress
    const academyProgress = await db.select({
      courseId: courseProgress.courseId,
      status: courseProgress.status,
      completedAt: courseProgress.completedAt,
      courseTitle: courses.title
    })
    .from(courseProgress)
    .leftJoin(courses, eq(courseProgress.courseId, courses.id))
    .where(eq(courseProgress.user_id, userId));

    // 6. Fetch Studio Interests
    const studioInterests = await db.select({
      workshopId: workshopInterest.id, // Using interest ID as proxy
      status: workshopInterest.status,
      createdAt: workshopInterest.createdAt,
      // We could join with workshops if needed, but interest table has some meta
    })
    .from(workshopInterest)
    .where(eq(workshopInterest.user_id, userId));

    // Construct the 360 Profile
    const fullProfile = {
      profile: {
        ...user,
        displayName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      },
      financials: {
        totalSpent,
        averageOrderValue,
        orderCount: userOrders.length,
        orders: userOrders,
        currency: 'EUR'
      },
      activity: {
        timeline: activityLog,
        lastActive: user.lastActive,
      },
      marketing: {
        touchpoints: marketingTouchpoints,
        visitorProfile: visitorData[0] || null,
        howHeard: user.howHeard
      },
      education: {
        courses: academyProgress,
        workshops: studioInterests
      }
    };

    return NextResponse.json(fullProfile);
  } catch (error) {
    console.error('[Admin User Detail Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}
