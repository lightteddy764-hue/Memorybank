import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// The admin client bypasses Row Level Security (RLS). 
// Used in API routes and server actions for IP-based project isolation.
export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey);
