import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    console.error("🚨 CRITICAL: Supabase Environment Variables are missing!");
}

export const supabase = createClient(
    PUBLIC_SUPABASE_URL || 'https://MISSING-URL-IN-VERCEL.supabase.co', 
    PUBLIC_SUPABASE_ANON_KEY || 'MISSING-KEY'
);