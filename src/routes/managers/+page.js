import { getLeagueMatchups, getLeagueTeamManagers } from '$lib/utils/helper';
import { activeLeague } from '$lib/stores/leagueContext.js';
import { get } from 'svelte/store';

export const ssr = false;

export async function load() {
    const activeStore = get(activeLeague);
    const dynamicLeagueID = activeStore?.sleeper_league_id;

    const matchupsData = getLeagueMatchups(dynamicLeagueID);
    const leagueTeamManagersData = getLeagueTeamManagers(dynamicLeagueID);
    
    // Await the API data to build the managers array dynamically
    const managersObj = await leagueTeamManagersData;
    const users = managersObj?.users || {};
    
    const dynamicManagers = Object.keys(users).map(userId => {
        const user = users[userId];
        return {
            managerID: userId,
            name: user.metadata?.team_name || user.display_name,
            photo: user.metadata?.avatar || `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
            mode: 'Dynasty'
        };
    });

    return {
        matchupsData,
        leagueTeamManagersData,
        managers: dynamicManagers // Injects the auto-generated list
    };
}