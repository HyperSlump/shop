-- Allow multiple purchases to share the same stripe_session_id
ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_stripe_session_id_key;

-- Create an index to make looking up purchases by session ID fast
CREATE INDEX IF NOT EXISTS idx_purchases_session_id ON public.purchases(stripe_session_id);
