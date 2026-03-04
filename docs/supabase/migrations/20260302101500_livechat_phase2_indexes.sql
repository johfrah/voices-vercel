BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS chat_conversations_status_updated_at_idx
  ON public.chat_conversations (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS chat_conversations_user_id_updated_at_idx
  ON public.chat_conversations (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS chat_conversations_updated_at_idx
  ON public.chat_conversations (updated_at DESC);

CREATE INDEX IF NOT EXISTS chat_messages_conversation_id_idx
  ON public.chat_messages (conversation_id);

CREATE INDEX IF NOT EXISTS chat_messages_conversation_id_id_idx
  ON public.chat_messages (conversation_id, id DESC);

CREATE INDEX IF NOT EXISTS chat_conversations_guest_name_trgm_idx
  ON public.chat_conversations
  USING gin (guest_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS chat_conversations_guest_email_trgm_idx
  ON public.chat_conversations
  USING gin (guest_email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS chat_messages_message_trgm_idx
  ON public.chat_messages
  USING gin (message gin_trgm_ops);

COMMIT;
