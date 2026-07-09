import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { syncActiveLeague } from '$lib/utils/leagueInfo';
import { awards, leagueData, upcomingDraft, previousDrafts, matchupsStore, records, rostersStore, transactionsStore, teamManagersStore, brackets, standingsStore } from '$lib/stores';

export const activeLeague = writable({
    id: null,
    sleeper_league_id: null,
    platform: 'sleeper',
    league_name: 'Loading...',
    theme_settings: null,
    homepage_text: '',
    constitution_text: '',
    logo_url: null,
    is_commissioner: false
});

export const userLeaguesList = writable([]);

export const loadLeagueContext = async (userId, targetLeagueId = null) => {
    if (!userId) return false;
    try {
        const { data: userLeagues, error: linkError } = await supabase
            .from('user_leagues')
            .select(`league_id, is_commissioner, leagues ( league_name )`)
            .eq('user_id', userId);

        if (linkError || !userLeagues || userLeagues.length === 0) return false;

        const formattedLeagues = userLeagues.map(link => ({
            id: link.league_id,
            name: link.leagues.league_name,
            is_commissioner: link.is_commissioner
        }));
        userLeaguesList.set(formattedLeagues);

        let savedLeagueId = null;
        if (typeof window !== 'undefined') savedLeagueId = localStorage.getItem('activeLeagueId');
         
        let activeLink;
        if (targetLeagueId) {
            activeLink = userLeagues.find(l => l.league_id === targetLeagueId);
            if (activeLink && typeof window !== 'undefined') localStorage.setItem('activeLeagueId', targetLeagueId);
        } else if (savedLeagueId) {
            activeLink = userLeagues.find(l => l.league_id === savedLeagueId);
        }
         
        if (!activeLink) {  
            activeLink = userLeagues[0]; 
            if (activeLink && typeof window !== 'undefined') localStorage.setItem('activeLeagueId', activeLink.league_id);
        }

        const { data: league, error: leagueError } = await supabase
            .from('leagues')
            .select('*')
            .eq('id', activeLink.league_id)
            .single();

        if (leagueError) return false;

        let currentSleeperId;
        const unsubscribe = activeLeague.subscribe(v => currentSleeperId = v.sleeper_league_id);
        unsubscribe();

        if (currentSleeperId && currentSleeperId !== league.sleeper_league_id) {
            awards.set({});
            leagueData.set({});
            upcomingDraft.set({});
            previousDrafts.set([]);
            matchupsStore.set({});
            records.set({});
            rostersStore.set({});
            transactionsStore.set({});
            teamManagersStore.set({ teamManagersMap: {}, currentSeason: null, users: {} });
            brackets.set({});
            standingsStore.set({});
        }

        activeLeague.set({
            id: league.id,
            sleeper_league_id: league.sleeper_league_id,
            platform: league.platform,
            league_name: league.league_name,
            theme_settings: league.theme_settings,
            homepage_text: league.homepage_text, 
            constitution_text: league.constitution_text || 'The commissioner has not published a league constitution yet.',
            logo_url: league.logo_url || null,
            is_commissioner: activeLink.is_commissioner
        });

        syncActiveLeague(league.sleeper_league_id, league.league_name);
        return true;
    } catch (err) {
        console.error("Context crash:", err);
        return false;
    }
};