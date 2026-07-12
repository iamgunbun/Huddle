<script>
    import { activeLeague } from '$lib/stores/leagueContext.js';
    import { getLeagueRosters, getLeagueTeamManagers, getLeagueData, loadPlayers } from '$lib/utils/helper';
    import { Rosters } from '$lib/components';
    import Roster from '$lib/Rosters/Roster.svelte';
    import LinearProgress from '@smui/linear-progress';
    import { browser } from '$app/environment';
    import { supabase } from '$lib/supabaseClient';

    let rosterData = $state(null);
    let leagueTeamManagersData = $state(null);
    let leagueData = $state(null);
    let playersInfo = $state(null);
    let loading = $state(true);

    let viewMode = $state('mine');
    let myRosterId = $state(null);
    let selectingTeam = $state(false);

    $effect(() => {
        if (browser && $activeLeague?.id) {
            const stored = localStorage.getItem(`my_roster_${$activeLeague.id}`);
            if (stored) myRosterId = stored;
        }
    });

    $effect(() => {
        if ($activeLeague?.sleeper_league_id) {
            loading = true;
            Promise.all([
                getLeagueRosters(),
                getLeagueTeamManagers(),
                getLeagueData(),
                loadPlayers() 
            ]).then(async ([r, m, d, p]) => {
                rosterData = r;
                leagueTeamManagersData = m;
                leagueData = d;
                playersInfo = p;
                
                // Auto-detect team from Supabase (Seamless sync for invited managers)
                const { data: sessionData } = await supabase.auth.getSession();
                const user = sessionData?.session?.user;
                
                if (user && $activeLeague?.id) {
                    const { data: ulData } = await supabase
                        .from('user_leagues')
                        .select('team_name')
                        .eq('user_id', user.id)
                        .eq('league_id', $activeLeague.id)
                        .single();
                    
                    if (ulData?.team_name && ulData.team_name !== 'Commissioner Team') {
                        const currentSeason = m.currentSeason;
                        const rostersMap = m.teamManagersMap[currentSeason];
                        if (rostersMap) {
                            for (const [rId, rData] of Object.entries(rostersMap)) {
                                if (rData.team?.name === ulData.team_name) {
                                    myRosterId = rId;
                                    if (browser) localStorage.setItem(`my_roster_${$activeLeague.id}`, rId);
                                    break;
                                }
                            }
                        }
                    }
                }
                
                loading = false;
            }).catch(e => {
                console.error("Roster layout mount catch:", e);
                loading = false;
            });
        }
    });

    async function setMyTeam(e) {
        const id = e.target.value;
        if (!id) return;
        myRosterId = id;
        if (browser) localStorage.setItem(`my_roster_${$activeLeague.id}`, id);
        
        // Save to Database so it syncs across their phone and computer
        const selectedTeamName = leagueTeamManagersData.teamManagersMap[leagueTeamManagersData.currentSeason][id].team.name;
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
            await supabase.from('user_leagues')
                .update({ team_name: selectedTeamName })
                .eq('user_id', sessionData.session.user.id)
                .eq('league_id', $activeLeague.id);
        }
        
        selectingTeam = false;
    }
</script>

<style>
    .page-container {
        position: relative;
        z-index: 1;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    .loading-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 60vh;
    }
    .loading-text {
        color: var(--accent-secondary, #eebf1c);
        font-family: 'Montserrat', sans-serif;
        font-size: 1.2em;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 25px;
    }
    .progress-container { width: 100%; max-width: 400px; border-radius: 8px; overflow: hidden; }
    
    .view-toggles {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 30px;
    }
    
    .toggle-btn {
        padding: 10px 25px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        transition: 0.2s;
    }
    
    .toggle-btn.active {
        background: var(--accent-secondary, #eebf1c);
        color: #0b0e14;
        border-color: var(--accent-secondary, #eebf1c);
    }
    
    .claim-box {
        background: rgba(11, 14, 20, 0.8);
        border: 1px solid rgba(238, 191, 28, 0.4);
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        max-width: 500px;
        margin: 40px auto;
    }
    
    .claim-box select {
        width: 100%;
        padding: 12px;
        background: #000;
        border: 1px solid #333;
        border-radius: 8px;
        color: #fff;
        font-size: 1em;
        margin-top: 15px;
        outline: none;
    }
</style>

<div class="page-container">
    {#if loading}
        <div class="loading-wrapper">
            <div class="loading-text">Loading Teams...</div>
            <div class="progress-container">
                <LinearProgress indeterminate />
            </div>
        </div>
    {:else if rosterData && leagueTeamManagersData && leagueData && playersInfo}
        
        <div class="view-toggles">
            <button class="toggle-btn" class:active={viewMode === 'mine'} onclick={() => viewMode = 'mine'}>My Team</button>
            <button class="toggle-btn" class:active={viewMode === 'all'} onclick={() => viewMode = 'all'}>All Teams</button>
        </div>

        {#if viewMode === 'mine'}
            {#if !myRosterId || selectingTeam}
                <div class="claim-box">
                    <h3 style="color: #f8fafc; margin-top: 0;">Which team is yours?</h3>
                    <p style="color: #94a3b8; font-size: 0.9em;">Select your team from the dropdown below to set up your personalized hub.</p>
                    <select onchange={setMyTeam}>
                        <option value="" disabled selected>-- Select Your Team --</option>
                        {#each Object.entries(leagueTeamManagersData.teamManagersMap[leagueTeamManagersData.currentSeason]) as [rId, rData]}
                            <option value={rId}>{rData.team.name}</option>
                        {/each}
                    </select>
                </div>
            {:else}
                <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                    <button style="background: transparent; border: none; color: #64748b; text-decoration: underline; cursor: pointer; font-size: 0.85em;" onclick={() => selectingTeam = true}>Wrong Team? Change it here.</button>
                </div>
                {@const myRoster = rosterData.rosters[myRosterId]}
                {#if myRoster}
                    <div style="max-width: 450px; margin: 0 auto;">
                        <Roster 
                            roster={myRoster} 
                            leagueTeamManagers={leagueTeamManagersData} 
                            players={playersInfo.players} 
                            startersAndReserve={rosterData.startersAndReserve} 
                            rosterPositions={leagueData.roster_positions} 
                            division={!myRoster.settings.division || myRoster.settings.division > (leagueData.settings.divisions || 1) ? 1 : myRoster.settings.division} 
                            expanded={false} 
                        />
                    </div>
                {/if}
            {/if}
        {:else}
            <Rosters {rosterData} leagueTeamManagers={leagueTeamManagersData} {leagueTeamManagersData} {leagueData} playersData={playersInfo} {playersInfo} />
        {/if}

    {:else}
        <div style="text-align: center; color: #ef4444; margin-top: 50px;">There was an issue fetching the team data.</div>
    {/if}
</div>