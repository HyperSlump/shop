-- Run this in your Supabase SQL Editor to allow multiple items per checkout session
ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_stripe_session_id_key;

-- Create an index on stripe_session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_session_id ON public.purchases(stripe_session_id);
