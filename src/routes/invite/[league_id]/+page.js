import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    console.log("Attempting to load league:", params.league_id);
    
    try {
        const { data: leagueDetails, error: err } = await supabase
            .from('leagues')
            .select('*')
            .eq('id', params.league_id)
            .single();

        if (err || !leagueDetails) {
            console.error("Database fetch error:", err);
            throw error(404, 'League not found');
        }

        return {
            leagueDetails,
            leagueId: params.league_id
        };
    } catch (e) {
        console.error("Critical Load Error:", e);
        throw error(500, 'Could not connect to league database');
    }
}