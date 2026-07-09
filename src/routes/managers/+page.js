import { getLeagueMatchups, getLeagueTeamManagers } from '$lib/utils/helper';
import { activeLeague } from '$lib/stores/leagueContext.js';

// 1. Disable Server-Side Rendering so it waits for the browser's local authentication
export const ssr = false;

export async function load() {
    // 2. Pause the SvelteKit loading sequence until the Supabase store is populated
    const dynamicLeagueID = await new Promise((resolve) => {
        const unsubscribe = activeLeague.subscribe(value => {
            if (value && value.sleeper_league_id) {
                unsubscribe();
                resolve(value.sleeper_league_id);
            }
        });
    });

    // 3. Pass the valid dynamic ID into the Sleeper fetch functions
    const matchupsData = getLeagueMatchups(dynamicLeagueID);
    const leagueTeamManagersData = getLeagueTeamManagers(dynamicLeagueID);

    return {
        matchupsData,
        leagueTeamManagersData
    };
}