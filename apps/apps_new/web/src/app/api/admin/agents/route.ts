import { db, agentPrompts, agentPromptVersions } from '@/lib/system/voices-config';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * 🤖 API: AGENT PROMPT MANAGEMENT (2026)
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const prompts = await db.select().from(agentPrompts).orderBy(agentPrompts.name);
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('[Admin Agents GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch agent prompts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { agentSlug, name, description, systemPrompt, metadata } = body;

    if (!agentSlug || !systemPrompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newPrompt] = await db.insert(agentPrompts).values({
      agentSlug,
      name,
      description,
      systemPrompt,
      metadata: metadata || {},
      version: 1,
      updatedAt: new Date()
    }).returning();

    // Create initial version
    await db.insert(agentPromptVersions).values({
      promptId: newPrompt.id,
      systemPrompt,
      version: 1,
      changeNote: 'Initial version',
      createdAt: new Date()
    });

    return NextResponse.json(newPrompt);
  } catch (error) {
    console.error('[Admin Agents POST Error]:', error);
    return NextResponse.json({ error: 'Failed to create agent prompt' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { id, systemPrompt, changeNote, metadata, isActive } = body;

    if (!id) return NextResponse.json({ error: 'Prompt ID missing' }, { status: 400 });

    const [current] = await db.select().from(agentPrompts).where(eq(agentPrompts.id, id)).limit(1);
    if (!current) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

    const nextVersion = current.version + 1;

    return await db.transaction(async (tx) => {
      // 1. Update main record
      const [updated] = await tx.update(agentPrompts)
        .set({
          systemPrompt: systemPrompt || current.systemPrompt,
          version: systemPrompt ? nextVersion : current.version,
          metadata: metadata || current.metadata,
          isActive: isActive !== undefined ? isActive : current.isActive,
          updatedAt: new Date()
        })
        .where(eq(agentPrompts.id, id))
        .returning();

      // 2. Create version record if prompt changed
      if (systemPrompt && systemPrompt !== current.systemPrompt) {
        await tx.insert(agentPromptVersions).values({
          promptId: id,
          systemPrompt,
          version: nextVersion,
          changeNote: changeNote || 'Bijgewerkt via beheer',
          createdAt: new Date()
        });
      }

      return NextResponse.json(updated);
    });
  } catch (error) {
    console.error('[Admin Agents PATCH Error]:', error);
    return NextResponse.json({ error: 'Failed to update agent prompt' }, { status: 500 });
  }
}
