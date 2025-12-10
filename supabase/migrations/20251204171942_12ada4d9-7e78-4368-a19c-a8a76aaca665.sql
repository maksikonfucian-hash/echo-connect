-- Create table for Telegram users
CREATE TABLE public.telegram_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  photo_url TEXT,
  auth_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (restrictive)
CREATE POLICY "Service role can manage all users"
ON public.telegram_users
FOR ALL
USING (auth.role() = 'service_role');

-- Create policy for users to read their own data
CREATE POLICY "Users can view their own data"
ON public.telegram_users
FOR SELECT
USING (auth.uid()::text = id::text);

-- Function to authenticate user by session_token
CREATE OR REPLACE FUNCTION public.get_user_by_session(p_session_token TEXT)
RETURNS TABLE (
  id UUID,
  telegram_id BIGINT,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  photo_url TEXT,
  referral_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT tu.id, tu.telegram_id, tu.first_name, tu.last_name, tu.username, tu.photo_url, tu.referral_code
  FROM public.telegram_users tu
  WHERE tu.session_token = p_session_token
  AND tu.session_token IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contacts (all users except self)
CREATE OR REPLACE FUNCTION public.get_contacts(p_session_token TEXT)
RETURNS TABLE (
  id UUID,
  telegram_id BIGINT,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  photo_url TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user id from session
  SELECT tu.id INTO v_user_id
  FROM public.telegram_users tu
  WHERE tu.session_token = p_session_token;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid session token';
  END IF;

  -- Return all users except self
  RETURN QUERY
  SELECT tu.id, tu.telegram_id, tu.first_name, tu.last_name, tu.username, tu.photo_url
  FROM public.telegram_users tu
  WHERE tu.id != v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_telegram_users_updated_at
BEFORE UPDATE ON public.telegram_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_telegram_users_telegram_id ON public.telegram_users(telegram_id);
CREATE INDEX idx_telegram_users_session_token ON public.telegram_users(session_token);