import { waitForAll, getLeagueRosters, getLeagueTeamManagers, getLeagueData, getLeagueTransactions, getAwards, getLeagueRecords } from '$lib/utils/helper';
import { activeLeague } from '$lib/stores/leagueContext.js';
import { get } from 'svelte/store';

export const ssr = false;

export async function load({ url }) {
    const activeStore = get(activeLeague);
    const dynamicLeagueID = activeStore?.sleeper_league_id;

    const managersInfo = waitForAll(
        getLeagueRosters(dynamicLeagueID),
        getLeagueTeamManagers(dynamicLeagueID),
        getLeagueData(dynamicLeagueID),
        getLeagueTransactions(false),
        getAwards(),
        getLeagueRecords(),
    );

    const teamManagers = await getLeagueTeamManagers(dynamicLeagueID);
    const users = teamManagers?.users || {};
    
    const dynamicManagers = Object.keys(users).map(userId => {
        const user = users[userId];
        return {
            managerID: userId,
            name: user.metadata?.team_name || user.display_name,
            photo: user.metadata?.avatar || `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
            mode: 'Dynasty'
        };
    });

    const manager = url?.searchParams?.get('manager');
    
    return {
        manager: manager !== null && manager < dynamicManagers.length ? parseInt(manager) : -1,
        managers: dynamicManagers,
        managersInfo
    };
}