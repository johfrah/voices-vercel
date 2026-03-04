import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

type MailStatus = 'queued' | 'sent' | 'failed';

type HandshakeCreateInput = {
  template_key: string;
  recipient_email: string;
  subject: string;
  market_code?: string | null;
  world_id?: number | null;
  journey_code?: string | null;
  language_code?: string | null;
  source_host?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  approval_queue_id?: number | null;
  payload?: Record<string, unknown>;
  meta_data?: Record<string, unknown>;
};

type HandshakeRow = {
  id: number;
  handshake_id: string;
};

const EMAIL_HANDSHAKE_TABLE = 'email_status_handshakes';

let cachedClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  cachedClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}

function nowIso(): string {
  return new Date().toISOString();
}

function createHandshakeId(): string {
  try {
    return randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 10)}`;
  }
}

function isMissingTableError(errorMessage: string): boolean {
  const message = String(errorMessage || '').toLowerCase();
  return message.includes('relation') && message.includes('does not exist');
}

export class EmailHandshakeService {
  static async createQueued(input: HandshakeCreateInput): Promise<HandshakeRow | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from(EMAIL_HANDSHAKE_TABLE)
      .insert({
        handshake_id: createHandshakeId(),
        template_key: input.template_key,
        status: 'queued' as MailStatus,
        recipient_email: input.recipient_email,
        subject: input.subject,
        market_code: input.market_code || null,
        world_id: input.world_id || null,
        journey_code: input.journey_code || null,
        language_code: input.language_code || null,
        source_host: input.source_host || null,
        target_type: input.target_type || null,
        target_id: input.target_id || null,
        approval_queue_id: input.approval_queue_id || null,
        payload: input.payload || {},
        meta_data: input.meta_data || {},
        updated_at: nowIso(),
      })
      .select('id, handshake_id')
      .single();

    if (error) {
      if (!isMissingTableError(error.message)) {
        console.warn('[EmailHandshakeService] Failed to create queued handshake:', error.message);
      }
      return null;
    }

    return data as HandshakeRow;
  }

  static async markSent(params: {
    id: number;
    provider_message_id?: string | null;
    mail_content_id?: number | null;
  }): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
      .from(EMAIL_HANDSHAKE_TABLE)
      .update({
        status: 'sent' as MailStatus,
        provider_message_id: params.provider_message_id || null,
        mail_content_id: params.mail_content_id || null,
        sent_at: nowIso(),
        updated_at: nowIso(),
      })
      .eq('id', params.id);

    if (error && !isMissingTableError(error.message)) {
      console.warn('[EmailHandshakeService] Failed to mark handshake as sent:', error.message);
    }
  }

  static async markFailed(params: {
    id: number;
    error_message: string;
    provider_message_id?: string | null;
  }): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
      .from(EMAIL_HANDSHAKE_TABLE)
      .update({
        status: 'failed' as MailStatus,
        provider_message_id: params.provider_message_id || null,
        error_message: params.error_message,
        failed_at: nowIso(),
        updated_at: nowIso(),
      })
      .eq('id', params.id);

    if (error && !isMissingTableError(error.message)) {
      console.warn('[EmailHandshakeService] Failed to mark handshake as failed:', error.message);
    }
  }
}
