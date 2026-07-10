import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { data: leagueDetails, error: err } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', params.league_id)
        .single();

    if (err || !leagueDetails) {
        throw error(404, 'League not found');
    }

    return {
        leagueDetails,
        leagueId: params.league_id
    };
}