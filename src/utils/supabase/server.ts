import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// The admin client bypasses Row Level Security (RLS). 
// ONLY use this in secure server-side API routes, never expose to the frontend.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
