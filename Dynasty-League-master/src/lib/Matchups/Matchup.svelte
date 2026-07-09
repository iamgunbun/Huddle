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

    $: teamAPoints = teamA.points ? round(teamA.points.reduce((t, nV) => t + nV, 0)) : 0;
    $: teamBPoints = teamB.points ? round(teamB.points.reduce((t, nV) => t + nV, 0)) : 0;
    
    // Calculate Projections
    $: teamAProj = teamA.starters ? round(teamA.starters.reduce((t, s) => t + (players[s]?.wi?.[displayWeek]?.p || 0), 0)) : 0;
    $: teamBProj = teamB.starters ? round(teamB.starters.reduce((t, s) => t + (players[s]?.wi?.[displayWeek]?.p || 0), 0)) : 0;

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
    .matchup-container {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(238, 191, 28, 0.15);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        margin: 15px auto;
        max-width: 850px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .matchup-container:hover {
        border-color: rgba(238, 191, 28, 0.5);
        transform: translateY(-2px);
    }
    .matchup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;
    }
    .team-block {
        display: flex;
        align-items: center;
        gap: 15px;
        flex: 1;
    }
    .team-block.right {
        flex-direction: row-reverse;
        text-align: right;
    }
    .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.1);
        object-fit: cover;
        background: #111;
    }
    .team-name {
        font-weight: 700;
        color: #f8fafc;
        font-size: 1.1em;
    }
    .score-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 20px;
        border-left: 1px solid rgba(255, 255, 255, 0.05);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        min-width: 160px;
    }
    .actual-score {
        font-size: 1.4em;
        font-weight: 800;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 15px;
    }
    .proj-score {
        font-size: 0.8em;
        color: #94a3b8;
        display: flex;
        gap: 40px;
        margin-top: 6px;
    }
    .winning { color: #eebf1c; text-shadow: 0 0 10px rgba(238,191,28,0.4); }
    .losing { color: #94a3b8; }

    @media (max-width: 600px) {
        .matchup-header { padding: 10px; gap: 5px; }
        .team-name { font-size: 0.85em; }
        .avatar { width: 35px; height: 35px; }
        .score-block { padding: 0 5px; min-width: 90px; border: none; }
        .actual-score { font-size: 1.1em; gap: 10px; }
        .proj-score { font-size: 0.7em; gap: 20px; }
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
                <span style="color: rgba(255,255,255,0.2); font-size: 0.8em;">VS</span>
                <span class="{teamBPoints > teamAPoints ? 'winning' : 'losing'}">{teamBPoints}</span>
            </div>
            <div class="proj-score">
                <span>{teamAProj}</span>
                <span>{teamBProj}</span>
            </div>
        </div>

        <!-- Team B -->
        <div class="team-block right" onclick={(e) => { e.stopPropagation(); gotoManager({year, leagueTeamManagers, rosterID: teamB.roster_id}); }}>
            <img class="avatar" src="{teamBInfo.avatar}" alt="Team B" />
            <span class="team-name">{teamBInfo.name}</span>
        </div>
    </div>

    <!-- Dropdown Player Matchups -->
    {#if expanded || expandOverride}
        <div class="matchup-details" style="padding: 10px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3);">
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