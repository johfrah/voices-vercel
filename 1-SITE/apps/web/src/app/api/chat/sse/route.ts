import { db } from '@db';
import { chatMessages } from '@db/schema';
import { and, asc, eq, gt } from 'drizzle-orm';

/**
 * ⚡ REAL-TIME CHAT SSE (2026)
 * 
 * Native Server-Sent Events handler for VoicyChat.
 * Replaces legacy PHP 15-chat-sse.php.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = parseInt(searchParams.get('conversationId') || '0');
  let lastMessageId = parseInt(searchParams.get('lastMessageId') || '0');
  
  // 🛡️ CHRIS-PROTOCOL: Prevent Postgres integer out-of-range error
  if (isNaN(lastMessageId) || lastMessageId > 2147483647) {
    lastMessageId = 0;
  }

  if (!conversationId) {
    return new Response('Missing conversationId', { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Initial connection
      sendEvent({ type: 'connected', conversationId });

      // Poll loop (simulating real-time with database checks)
      // In a full production environment, this would use Postgres NOTIFY/LISTEN or a PubSub
      const interval = setInterval(async () => {
        try {
          const newMessages = await db.select()
            .from(chatMessages)
            .where(
              and(
                eq(chatMessages.conversationId, conversationId),
                gt(chatMessages.id, lastMessageId)
              )
            )
            .orderBy(asc(chatMessages.id));

          if (newMessages.length > 0) {
            sendEvent({
              type: 'new_messages',
              messages: newMessages
            });
            // Note: In a real app, the client would update its lastMessageId
          }

          // Heartbeat
          sendEvent({ type: 'heartbeat' });
        } catch (error) {
          console.error('SSE Error:', error);
        }
      }, 3000); // Check every 3 seconds

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
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
