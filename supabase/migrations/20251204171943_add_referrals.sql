-- Add referral system tables and logic

-- Add referral_code to telegram_users
ALTER TABLE public.telegram_users
ADD COLUMN referral_code TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.telegram_users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.telegram_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bonus_awarded BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referrals (restrictive)
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (referrer_id IN (
  SELECT id FROM public.telegram_users WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
));

CREATE POLICY "System can insert referrals"
ON public.referrals
FOR INSERT
WITH CHECK (true);

-- Function to handle referral signup
CREATE OR REPLACE FUNCTION public.handle_referral_signup(
  p_telegram_id BIGINT,
  p_referral_code TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_referrer_id UUID;
  v_new_user_id UUID;
BEGIN
  -- Find referrer if referral_code provided
  IF p_referral_code IS NOT NULL THEN
    SELECT id INTO v_referrer_id
    FROM public.telegram_users
    WHERE referral_code = p_referral_code;

    IF v_referrer_id IS NULL THEN
      RAISE EXCEPTION 'Invalid referral code';
    END IF;
  END IF;

  -- Get the new user id (assuming user already exists from auth)
  SELECT id INTO v_new_user_id
  FROM public.telegram_users
  WHERE telegram_id = p_telegram_id;

  IF v_new_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Prevent self-referral
  IF v_referrer_id = v_new_user_id THEN
    RAISE EXCEPTION 'Cannot refer yourself';
  END IF;

  -- Insert referral if referrer exists
  IF v_referrer_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id)
    VALUES (v_referrer_id, v_new_user_id)
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
  END IF;

  RETURN v_new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_telegram_users_referral_code ON public.telegram_users(referral_code);