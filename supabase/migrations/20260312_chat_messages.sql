-- Meet Mario — Chat History Persistence
-- Run this in Supabase SQL Editor to enable chat history

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text          NOT NULL CHECK (role IN ('user', 'assistant')),
  content     text          NOT NULL,
  created_at  timestamptz   DEFAULT now() NOT NULL
);

-- Row Level Security: users can only read/write their own messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chat messages"
  ON public.chat_messages
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast per-user chronological queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON public.chat_messages (user_id, created_at ASC);
