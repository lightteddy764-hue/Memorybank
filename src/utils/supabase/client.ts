import { createClient } from '@supabase/supabase-js';

// We provide fallback strings so that Next.js doesn't crash during the build phase 
// if environment variables are not yet injected by the hosting provider.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
