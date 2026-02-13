/**
 * 📱 TELEGRAM-BOB BRIDGE WEBHOOK
 *
 * Receives incoming messages from Telegram and routes them to Bob.
 * LEX: Privacy-First Intelligence. Nuclear Hardening.
 * ANNA: Altijd Aan.
 *
 * ENV VARS (see .env.example):
 * - TELEGRAM_BOT_TOKEN: Bot token from @BotFather
 * - TELEGRAM_WEBHOOK_SECRET: Secret token for X-Telegram-Bot-Api-Secret-Token verification
 * - TELEGRAM_ALLOWED_USER_IDS: Comma-separated Telegram user IDs (e.g. "123456789,987654321")
 *
 * Webhook must be configured via:
 * POST https://api.telegram.org/bot<TOKEN>/setWebhook
 * Body: url=<BASE_URL>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';

/** Telegram Update payload (subset we care about) */
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name?: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
    date: number;
  };
  edited_message?: { from?: { id: number }; chat: { id: number }; text?: string };
}

function isAllowedUser(userId: number): boolean {
  const allowed = process.env.TELEGRAM_ALLOWED_USER_IDS;
  if (!allowed?.trim()) return true; // No whitelist = allow all (dev/optional)
  const ids = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  return ids.includes(String(userId));
}

function getSenderId(update: TelegramUpdate): number | undefined {
  const msg = update.message ?? update.edited_message;
  return msg?.from?.id;
}

function getChatId(update: TelegramUpdate): number | undefined {
  const msg = update.message ?? update.edited_message;
  return msg?.chat?.id;
}

function getText(update: TelegramUpdate): string | undefined {
  const msg = update.message ?? update.edited_message;
  return msg?.text;
}

export async function POST(request: NextRequest) {
  try {
    // 1. LEX: Verify webhook secret (Nuclear Hardening)
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const headerSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (webhookSecret) {
      if (!headerSecret || headerSecret !== webhookSecret) {
        return new NextResponse('Unauthorized', { status: 403 });
      }
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.warn('📱 Telegram webhook: TELEGRAM_BOT_TOKEN not set, skipping reply');
    }

    const body = (await request.json()) as TelegramUpdate;

    // 2. LEX: User whitelist (prevent unauthorized access)
    const senderId = getSenderId(body);
    if (senderId !== undefined && !isAllowedUser(senderId)) {
      console.warn(`📱 Telegram: Rejected message from unauthorized user ${senderId}`);
      return NextResponse.json({ ok: true }); // 200 to prevent Telegram retries
    }

    const chatId = getChatId(body);
    const text = getText(body);

    // 3. Log incoming message (Bob is listening)
    console.log('[Telegram-Bob]', {
      update_id: body.update_id,
      from: senderId,
      chat_id: chatId,
      text: text ?? '(no text)',
      at: new Date().toISOString(),
    });

    // 4. Basic "Bob is listening" reply for text messages
    if (chatId && text && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'Bob ontvangt je bericht.',
            parse_mode: 'HTML',
          }),
        });
      } catch (sendErr) {
        console.error('📱 Telegram sendMessage failed:', sendErr);
        // Still return 200 - we logged it, Bob "listened"
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('📱 Telegram webhook error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
