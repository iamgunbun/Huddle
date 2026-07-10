import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { data: leagueDetails, error: err } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', params.league_id)
        .single();

    if (err || !leagueDetails) {
        console.error("Database fetch error or RLS block:", err);
        // Correctly throws a 404 without a try/catch loop swallowing it
        throw error(404, 'League not found or access denied by Supabase RLS.');
    }

    return {
        leagueDetails,
        leagueId: params.league_id
    };
}