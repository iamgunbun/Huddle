import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
    const { data: leagueDetails, error: err } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', params.league_id)
        .single();

    if (err || !leagueDetails) {
        console.error("Database fetch error or RLS block:", err);
        throw error(404, 'League not found or access denied by Supabase RLS.');
    }

    // Ping Sleeper API to get all managers/teams in this specific league
    let sleeperUsers = [];
    if (leagueDetails.sleeper_league_id) {
        try {
            const res = await fetch(`https://api.sleeper.app/v1/league/${leagueDetails.sleeper_league_id}/users`);
            if (res.ok) {
                sleeperUsers = await res.json();
            }
        } catch (e) {
            console.error("Failed to fetch Sleeper rosters", e);
        }
    }

    return {
        leagueDetails,
        leagueId: params.league_id,
        sleeperUsers
    };
}