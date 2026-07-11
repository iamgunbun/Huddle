<script>
    import { gotoManager, round } from '$lib/utils/helper';
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import MatchupPlayer from './MatchupPlayer.svelte';

    export let matchup, players, ix, active, year, displayWeek, expandOverride = false, leagueTeamManagers;

    let expanded = false;
    
    $: teamA = matchup[0];
    $: teamB = matchup[1];

    $: teamAInfo = getTeamFromTeamManagers(leagueTeamManagers, teamA.roster_id, year);
    $: teamBInfo = getTeamFromTeamManagers(leagueTeamManagers, teamB.roster_id, year);

    // Added parseFloat to guarantee mathematical addition, not string concatenation
    $: teamAPoints = teamA.points ? round(teamA.points.reduce((t, nV) => t + parseFloat(nV || 0), 0)) : 0;
    $: teamBPoints = teamB.points ? round(teamB.points.reduce((t, nV) => t + parseFloat(nV || 0), 0)) : 0;
    
    // CRITICAL FIX: Force projection strings into floats BEFORE adding them together
    $: teamAProj = teamA.starters ? round(teamA.starters.reduce((t, s) => t + (parseFloat(players[s]?.wi?.[displayWeek]?.p) || 0), 0)) : 0;
    $: teamBProj = teamB.starters ? round(teamB.starters.reduce((t, s) => t + (parseFloat(players[s]?.wi?.[displayWeek]?.p) || 0), 0)) : 0;

    const toggleExpanded = () => {
        expanded = !expanded;
    };

    $: if (active === ix) {
        expanded = true;
    } else if (!expandOverride) {
        expanded = false;
    }
</script>

<style>
    /* Sleeper-inspired Mobile App Aesthetics */
    .matchup-container {
        background: rgba(22, 28, 38, 0.85); /* Deep native-app blue/gray */
        border-radius: 16px;
        margin: 12px auto;
        max-width: 850px;
        overflow: hidden;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s;
        -webkit-tap-highlight-color: transparent;
    }

    /* Active state gives physical touch feedback on mobile */
    .matchup-container:active {
        transform: scale(0.98);
        background: rgba(30, 38, 52, 0.95);
    }

    .matchup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
    }

    .team-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0; /* Prevents text overflow breaking flexbox */
    }

    .avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.1);
        object-fit: cover;
        background: #111;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }

    .team-name {
        font-weight: 700;
        color: #f8fafc;
        font-size: 0.95em;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        max-width: 120px;
    }

    .score-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 15px;
        flex: 1.2;
    }

    .actual-score {
        font-size: 1.6em;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 4px;
        letter-spacing: -0.5px;
    }

    .proj-score {
        font-size: 0.75em;
        font-weight: 600;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .vs-divider {
        font-size: 0.5em;
        color: rgba(255,255,255,0.15);
        font-weight: 800;
        margin: 0 8px;
    }

    .winning { 
        color: var(--accent-secondary, #eebf1c); 
        text-shadow: 0 0 15px rgba(238, 191, 28, 0.2); 
    }
    
    .losing { 
        color: #f8fafc; 
    }

    /* Mobile Responsive Tightening */
    @media (max-width: 500px) {
        .matchup-header { padding: 12px 10px; }
        .avatar { width: 44px; height: 44px; }
        .team-name { font-size: 0.8em; max-width: 90px; }
        .actual-score { font-size: 1.35em; }
        .proj-score { font-size: 0.7em; }
    }
</style>

<div class="matchup-container" onclick={toggleExpanded}>
    <div class="matchup-header">
        <!-- Team A -->
        <div class="team-block" onclick={(e) => { e.stopPropagation(); gotoManager({year, leagueTeamManagers, rosterID: teamA.roster_id}); }}>
            <img class="avatar" src="{teamAInfo.avatar}" alt="Team A" />
            <span class="team-name">{teamAInfo.name}</span>
        </div>

        <!-- Scores -->
        <div class="score-block">
            <div class="actual-score">
                <span class="{teamAPoints > teamBPoints ? 'winning' : 'losing'}">{teamAPoints}</span>
                <span class="vs-divider">VS</span>
                <span class="{teamBPoints > teamAPoints ? 'winning' : 'losing'}">{teamBPoints}</span>
            </div>
            <div class="proj-score">
                <span>Proj {teamAProj}</span>
                <span>Proj {teamBProj}</span>
            </div>
        </div>

        <!-- Team B -->
        <div class="team-block" onclick={(e) => { e.stopPropagation(); gotoManager({year, leagueTeamManagers, rosterID: teamB.roster_id}); }}>
            <img class="avatar" src="{teamBInfo.avatar}" alt="Team B" />
            <span class="team-name">{teamBInfo.name}</span>
        </div>
    </div>

    <!-- Dropdown Player Matchups -->
    {#if expanded || expandOverride}
        <div class="matchup-details" style="background: rgba(0,0,0,0.25); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 5px;">
            {#if teamA.starters && teamB.starters}
                {#each teamA.starters as starter, ix}
                    <MatchupPlayer 
                        playerA={teamA.starters[ix]} 
                        playerB={teamB.starters[ix]} 
                        {players} 
                        playerAProj={players[teamA.starters[ix]]?.wi?.[displayWeek]?.p || 0}
                        playerBProj={players[teamB.starters[ix]]?.wi?.[displayWeek]?.p || 0}
                        playerAScore={teamA.points[ix]}
                        playerBScore={teamB.points[ix]}
                    />
                {/each}
            {/if}
        </div>
    {/if}
</div>