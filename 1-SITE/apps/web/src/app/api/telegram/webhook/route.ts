/**
 * 📱 TELEGRAM-BOB BRIDGE WEBHOOK
 *
 * Receives incoming messages from Telegram and routes them to Bob or Voicy.
 * BOB: Wise, authoritative, warm. Knows codebase, agents, Voices mission.
 * VOICY: Friendly, helpful, expert in voices/studio/pricing (Chatty domain). /voicy or Voicy-mode.
 * CHATTY: Conversational excellence. Welcome flow for /start. Voicy persona.
 * LEX: Privacy-First Intelligence. Nuclear Hardening.
 * ANNA: Altijd Aan.
 *
 * /voicy <prompt>  → Route to Voicy (one-shot)
 * /voicy           → Toggle Voicy-mode (subsequent messages go to Voicy)
 * /bob             → Exit Voicy-mode, back to Bob
 *
 * ENV VARS (see .env.example):
 * - TELEGRAM_BOT_TOKEN: Bot token from @BotFather
 * - TELEGRAM_WEBHOOK_SECRET: Secret token for X-Telegram-Bot-Api-Secret-Token verification
 * - TELEGRAM_ALLOWED_USER_IDS: Comma-separated Telegram user IDs (e.g. "123456789,987654321")
 * - GOOGLE_API_KEY: For Gemini (Bob's AI brain)
 *
 * Webhook must be configured via:
 * POST https://api.telegram.org/bot<TOKEN>/setWebhook
 * Body: url=<BASE_URL>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
 */

import { GeminiService } from '@/services/GeminiService';
import { NextRequest, NextResponse } from 'next/server';
import { BOB_WELCOME_MESSAGE } from '../bob-welcome';
import { buildVoicyTelegramPrompt } from '../voicy-telegram-prompt';

/** Voicy-mode: chatIds that receive Voicy instead of Bob until /bob. In-memory; resets on cold start. */
const voicyModeChats = new Set<number>();

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

/** Result of Voicy routing: who to use, what to send, or a fixed reply for mode switches. */
type VoicyRoutingResult =
  | { useVoicy: boolean; payload: string; fixedReply?: undefined }
  | { useVoicy: boolean; payload: string; fixedReply: string };

/** Detect Voicy routing: /voicy prefix or Voicy-mode active for this chat. */
function resolveVoicyRouting(text: string, chatId: number): VoicyRoutingResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // /bob → exit Voicy-mode
  if (lower === '/bob') {
    voicyModeChats.delete(chatId);
    return { useVoicy: false, payload: '', fixedReply: 'Terug bij Bob. Stel gerust je vraag over het project of de agents.' };
  }

  // /voicy → toggle Voicy-mode
  if (lower === '/voicy') {
    if (voicyModeChats.has(chatId)) {
      voicyModeChats.delete(chatId);
      return { useVoicy: false, payload: '', fixedReply: 'Je praat weer met Bob.' };
    }
    voicyModeChats.add(chatId);
    return {
      useVoicy: false,
      payload: '',
      fixedReply: 'Voicy-modus aan. Stel je vraag over stemmen, prijzen of de studio — ik help je.',
    };
  }

  // /voicy <prompt> → one-shot Voicy; /voicy  (nothing) → toggle
  if (lower.startsWith('/voicy ')) {
    const payload = trimmed.slice(7).trim();
    if (!payload) {
      if (voicyModeChats.has(chatId)) {
        voicyModeChats.delete(chatId);
        return { useVoicy: false, payload: '', fixedReply: 'Je praat weer met Bob.' };
      }
      voicyModeChats.add(chatId);
      return {
        useVoicy: false,
        payload: '',
        fixedReply: 'Voicy-modus aan. Stel je vraag over stemmen, prijzen of de studio — ik help je.',
      };
    }
    return { useVoicy: true, payload };
  }

  // In Voicy-mode: route all messages to Voicy
  if (voicyModeChats.has(chatId)) {
    return { useVoicy: true, payload: trimmed };
  }

  return { useVoicy: false, payload: trimmed };
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

    // 3. Log incoming message
    const routing = chatId && text ? resolveVoicyRouting(text, chatId) : null;
    console.log('[Telegram]', {
      update_id: body.update_id,
      from: senderId,
      chat_id: chatId,
      text: text ?? '(no text)',
      voicy: routing?.useVoicy ?? false,
      at: new Date().toISOString(),
    });

    // 4. BOB/VOICY: Intelligent reply (welcome on /start, mode switches, or Gemini)
    if (chatId && text && process.env.TELEGRAM_BOT_TOKEN) {
      let replyText: string;
      const isStart = text.trim().toLowerCase() === '/start';

      // Mode switch: /voicy or /bob → fixed reply
      if (routing?.fixedReply) {
        replyText = routing.fixedReply;
        console.log('[Telegram] Mode switch reply to chat', chatId);
      } else if (isStart) {
        // CHATTY: Warm welcome from Bob for new users or /start
        replyText = BOB_WELCOME_MESSAGE;
        console.log('[Telegram-Bob] Welcome sent to chat', chatId);
      } else {
        // 🚀 DUAL AGENT ORCHESTRATION: Both Bob and Voicy can answer
        try {
          const { KnowledgeService } = await import('@/services/KnowledgeService');
          const { PricingEngine } = await import('@/lib/pricing-engine');
          const knowledge = KnowledgeService.getInstance();
          const coreBriefing = await knowledge.getCoreBriefing();
          const voicyBriefing = await knowledge.getFullVoicyBriefing();
          const isAdmin = senderId !== undefined && isAllowedUser(senderId);
          const gemini = GeminiService.getInstance();

          // ⚡ PRICING CONTEXT: Inject real-time pricing data from Supabase app_configs
          const { data: configs } = await (await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/app_configs?key=eq.pricing_config`, {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            }
          })).json().then(res => ({ data: res }));

          const dbPricing = configs?.[0]?.value || {};
          
          const pricingContext = `
ACTUELE TARIEVEN (SUPABASE SOURCE OF TRUTH):
- Basis Video (unpaid): €${dbPricing.unpaid_base || 239} (tot 100 woorden)
- Telefoon/IVR: €${dbPricing.ivr_base || 89} (tot 5 prompts)
- Commercial (paid): Vanaf €250 (afhankelijk van usage)
- Extra woorden: €${dbPricing.bulk_word_ivr || 0.25} per woord
- Wachtmuziek: €${dbPricing.music_mix || 59} per track
- BTW: ${Math.round((dbPricing.vat_rate || 0.21) * 100)}%
          `;

          // Determine if we should use Voicy (mode or /voicy prefix)
          const useVoicy = routing?.useVoicy ?? false;
          const payload = routing?.payload ?? text;

          if (useVoicy) {
            // VOICY: Chatty domain — voices, pricing, studio (Ademing vibe)
            const prompt = buildVoicyTelegramPrompt({
              userMessage: payload,
              coreBriefing: `${coreBriefing}\n${voicyBriefing}\n${pricingContext}`,
              isAdmin,
            });
            replyText = await gemini.generateText(prompt);
            console.log('[Telegram-Voicy] Full Knowledge Response generated for chat', chatId);
          } else {
            // BOB: AI-powered response via Gemini
            const prompt = `
Je bent Bob, de Architect van Voices.be.
Je bent wijs, autoritair maar warm (Bob-methode). Je kent de codebase, de agents en de Voices-missie.

BELANGRIJK: Je bent niet alleen een filosoof, je bent een OPERATIONELE DIRIGENT.
- Als de gebruiker je iets vraagt, help je DIRECT met feiten, status of actie.
- Je hebt toegang tot alle agents (Chris, Anna, Laya, Moby, Mark, Suzy, Mat, Voicy, Cody, Kelly, Berny, Felix, Wim, Lex).
- Gebruik de informatie uit de Bijbels en de actuele tarieven hieronder om CONCREET te antwoorden.

${coreBriefing}
${pricingContext}

STRIKE PROTOCOL:
- Geen vage metaforen als de gebruiker om hulp vraagt.
- Wees de "Oervader" die problemen oplost.
- Als je het niet weet, vraag je om verduidelijking of stuur je een agent aan.
- Als de gebruiker vraagt "wat kost het?", geef je DIRECT de bedragen uit de lijst hierboven.

Bericht van de gebruiker: "${payload.replace(/"/g, '\\"')}"

Antwoord als de behulpzame, operationele Bob:
            `;
            replyText = await gemini.generateText(prompt);
            console.log('[Telegram-Bob] Response generated for chat', chatId);
          }
          
          replyText = replyText.trim().slice(0, 4096);
        } catch (aiErr) {
          console.error('📱 Telegram AI generation failed:', aiErr);
          replyText = 'Even nadenken — probeer het straks opnieuw of stel je vraag anders.';
        }
      }

      try {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
          }),
        });
      } catch (sendErr) {
        console.error('📱 Telegram sendMessage failed:', sendErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('📱 Telegram webhook error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
