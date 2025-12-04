import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

async function verifyTelegramAuth(authData: TelegramAuthData, botToken: string): Promise<boolean> {
  const { hash, ...dataToCheck } = authData;
  
  // Create data check string
  const dataCheckArr = Object.entries(dataToCheck)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`);
  const dataCheckString = dataCheckArr.join('\n');
  
  // Create secret key from bot token using SHA-256
  const encoder = new TextEncoder();
  const botTokenData = encoder.encode(botToken);
  const secretKey = await crypto.subtle.digest('SHA-256', botTokenData);
  
  // Create HMAC-SHA-256 hash
  const key = await crypto.subtle.importKey(
    'raw',
    secretKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataCheckString)
  );
  
  // Convert to hex
  const hashArray = Array.from(new Uint8Array(signature));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Check auth_date is not too old (24 hours)
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime - authData.auth_date > 86400) {
    console.log('Auth data is too old');
    return false;
  }
  
  return computedHash === hash;
}

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authData: TelegramAuthData = await req.json();
    console.log('Received auth data for telegram_id:', authData.id);

    // Verify the Telegram auth data
    const isValid = await verifyTelegramAuth(authData, botToken);
    if (!isValid) {
      console.error('Invalid Telegram auth data');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication data' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Telegram auth verified successfully');

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate session token
    const sessionToken = generateSessionToken();

    // Upsert user in database
    const { data: user, error: upsertError } = await supabase
      .from('telegram_users')
      .upsert({
        telegram_id: authData.id,
        first_name: authData.first_name,
        last_name: authData.last_name || null,
        username: authData.username || null,
        photo_url: authData.photo_url || null,
        auth_date: new Date(authData.auth_date * 1000).toISOString(),
        session_token: sessionToken,
      }, {
        onConflict: 'telegram_id',
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Database upsert error:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User saved/updated successfully:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          telegram_id: user.telegram_id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
        },
        session_token: sessionToken,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in telegram-auth function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
