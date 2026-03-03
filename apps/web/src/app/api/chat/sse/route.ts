import { db, chatMessages } from '@/lib/system/voices-config';
import { and, asc, eq, gt } from 'drizzle-orm';
import { recordChatSseMetric } from '@/lib/system/chat-observability';

/**
 *  REAL-TIME CHAT SSE (2026)
 * 
 * Native Server-Sent Events handler for VoicyChat.
 * Replaces legacy PHP 15-chat-sse.php.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = parseInt(searchParams.get('conversationId') || '0');
  let lastMessageId = parseInt(searchParams.get('lastMessageId') || '0');
  const pollMs = Math.min(Math.max(parseInt(searchParams.get('pollMs') || '1500', 10) || 1500, 900), 5000);
  const heartbeatMs = 15000;
  
  //  CHRIS-PROTOCOL: Prevent Postgres integer out-of-range error
  if (isNaN(lastMessageId) || lastMessageId > 2147483647) {
    lastMessageId = 0;
  }

  if (!conversationId) {
    return new Response('Missing conversationId', { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;
      let interval: ReturnType<typeof setInterval> | null = null;
      let lastHeartbeatAt = Date.now();

      const safeClose = () => {
        if (isClosed) return;
        isClosed = true;
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        try {
          controller.close();
        } catch {
          // Stream is already closed; ignore.
        }
      };

      const sendEvent = (data: any) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          safeClose();
        }
      };

      // Initial connection
      sendEvent({ type: 'connected', conversationId });

      // Poll loop (simulating real-time with database checks)
      // Faster-than-before polling for admin follow-up, with sparse heartbeat frames.
      interval = setInterval(async () => {
        if (isClosed || request.signal.aborted) {
          safeClose();
          return;
        }

        try {
          const pollStartedAt = Date.now();
          const newMessages = await db.select()
            .from(chatMessages)
            .where(
              and(
                eq(chatMessages.conversationId, conversationId),
                gt(chatMessages.id, lastMessageId)
              )
            )
            .orderBy(asc(chatMessages.id))
            .limit(50);

          recordChatSseMetric('poll', Date.now() - pollStartedAt, true);

          if (newMessages.length > 0) {
            lastMessageId = Math.max(...newMessages.map((m: any) => m.id));
            sendEvent({
              type: 'new_messages',
              messages: newMessages
            });
          }

          if (Date.now() - lastHeartbeatAt >= heartbeatMs) {
            sendEvent({ type: 'heartbeat' });
            lastHeartbeatAt = Date.now();
          }
        } catch (error) {
          console.error('SSE Error:', error);
          recordChatSseMetric('poll', 0, false);
          //  CHRIS-PROTOCOL: Stop bij fatale DB errors om serverload te beperken
          safeClose();
        }
      }, pollMs);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        safeClose();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
