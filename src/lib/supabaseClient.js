import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

// SvelteKit's native way to grab public variables safely
const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🚨 CRITICAL: Supabase Environment Variables are missing!");
}

export const supabase = createClient(
    supabaseUrl || 'https://MISSING-URL-IN-VERCEL.supabase.co', 
    supabaseAnonKey || 'MISSING-KEY'
);