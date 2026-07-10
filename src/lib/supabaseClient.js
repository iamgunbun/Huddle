import { createClient } from '@supabase/supabase-js'

// This safely checks for both VITE_ and PUBLIC_ naming conventions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Fail-safe to prevent the server from crashing completely if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🚨 CRITICAL: Supabase Environment Variables are missing! Check Vercel Settings.");
}

export const supabase = createClient(
    supabaseUrl || 'https://MISSING-URL-IN-VERCEL.supabase.co', 
    supabaseAnonKey || 'MISSING-KEY'
);