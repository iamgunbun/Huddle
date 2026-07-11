<script>
    import { onMount } from 'svelte';
    import LinearProgress from '@smui/linear-progress';
    
    import { getLeagueStandings, getLeagueRosters, getLeagueTeamManagers, getLeagueData, waitForAll } from '$lib/utils/helper';
    import { round, getTeamData } from '$lib/utils/helperFunctions/universalFunctions';

    let loading = $state(true);
    let powerRankings = $state([]);
    let errorMessage = $state(null);

    onMount(async () => {
        try {
            const [standingsData, rostersData, managersData, currentLeagueData] = await waitForAll(
                getLeagueStandings(),
                getLeagueRosters(),
                getLeagueTeamManagers(),
                getLeagueData()
            );

            const standings = standingsData?.standingsInfo || {};
            const rosters = rostersData?.rosters || {};
            const users = managersData?.users || {};
            const numTeams = Object.keys(rosters).length || 10;
            
            // 1. Fetch Previous Season Data to calculate analytical baseline ranks
            let prevRanksByOwner = {};
            
            if (currentLeagueData && currentLeagueData.previous_league_id) {
                try {
                    const [prevRostersRes, winnersBracketRes] = await Promise.all([
                        fetch(`https://api.sleeper.app/v1/league/${currentLeagueData.previous_league_id}/rosters`),
                        fetch(`https://api.sleeper.app/v1/league/${currentLeagueData.previous_league_id}/winners_bracket`)
                    ]);
                    
                    const prevRosters = await prevRostersRes.json();
                    const winnersBracket = await winnersBracketRes.json();

                    // Create roster_id -> owner_id mapping for the previous year
                    const prevOwnerMap = {};
                    prevRosters.forEach(r => {
                        prevOwnerMap[r.roster_id] = r.owner_id;
                    });

                    // Base Ranking via Regular Season (Wins & FPTS)
                    prevRosters.sort((a, b) => {
                        if (b.settings.wins !== a.settings.wins) return b.settings.wins - a.settings.wins;
                        const fptsA = a.settings.fpts + (a.settings.fpts_decimal / 100);
                        const fptsB = b.settings.fpts + (b.settings.fpts_decimal / 100);
                        return fptsB - fptsA;
                    });

                    prevRosters.forEach((r, index) => {
                        if (r.owner_id) prevRanksByOwner[r.owner_id] = index + 1;
                    });

                    // Overwrite Top 6 with exact Playoff Bracket Results
                    winnersBracket.forEach(match => {
                        if (match.p === 1) { // Championship Match
                            if (prevOwnerMap[match.w]) prevRanksByOwner[prevOwnerMap[match.w]] = 1;
                            if (prevOwnerMap[match.l]) prevRanksByOwner[prevOwnerMap[match.l]] = 2;
                        } else if (match.p === 3) { // 3rd Place Match
                            if (prevOwnerMap[match.w]) prevRanksByOwner[prevOwnerMap[match.w]] = 3;
                            if (prevOwnerMap[match.l]) prevRanksByOwner[prevOwnerMap[match.l]] = 4;
                        } else if (match.p === 5) { // 5th Place Match
                            if (prevOwnerMap[match.w]) prevRanksByOwner[prevOwnerMap[match.w]] = 5;
                            if (prevOwnerMap[match.l]) prevRanksByOwner[prevOwnerMap[match.l]] = 6;
                        }
                    });
                } catch (e) {
                    console.warn("Failed to parse previous season playoff data:", e);
                }
            }

            // 2. Blend baseline ranks with current live data
            let calculatedRanks = [];
            for (const rosterID in rosters) {
                const team = standings[rosterID] || { wins: 0, losses: 0, fpts: 0 };
                const ownerId = rosters[rosterID]?.owner_id;
                const manager = ownerId ? users[ownerId] : null;
                
                const teamInfo = getTeamData(users, ownerId);
                const teamName = teamInfo.name;
                const teamAvatar = teamInfo.avatar;

                // Pull analytical baseline rank from previous bracket (default to mid-pack if year 1)
                const prevRank = prevRanksByOwner[ownerId] || Math.ceil(numTeams / 2);

                const winWeight = team.wins * 15;
                const fptsWeight = team.fpts * 0.1;
                
                // Base team strength rating drawn from previous finish
                const basePower = 100 - (prevRank * 4); 
                
                // Live Power Score = Historical Base + Current Season Performance
                let powerScore = basePower + winWeight + fptsWeight;
                
                let playoffOdds, champOdds;
                
                // If preseason (no games played yet), heavily weigh the historical odds
                if (team.wins === 0 && team.fpts === 0) {
                    playoffOdds = Math.max(100 - (prevRank * 8), 1);
                    champOdds = Math.max(30 - (prevRank * 2), 1);
                } else {
                    // In-season: dynamically blend current power score into percentages
                    playoffOdds = Math.min(Math.max(round((powerScore / (basePower + 180)) * 100), 1), 99);
                    champOdds = Math.min(Math.max(round((powerScore / (basePower + 250)) * 100), 1), 45);
                }

                calculatedRanks.push({
                    rosterID,
                    teamName,
                    avatar: teamAvatar,
                    wins: team.wins,
                    losses: team.losses,
                    playoffOdds,
                    champOdds,
                    powerScore,
                    prevRank // Original baseline rank
                });
            }

            // 3. Sort purely by the dynamic Live Power Score
            calculatedRanks.sort((a, b) => b.powerScore - a.powerScore);

            powerRankings = calculatedRanks.map((team, index) => {
                const currentRank = index + 1;
                // Rank change now reflects how they've moved relative to their historical baseline!
                const rankChange = team.prevRank - currentRank;
                return { ...team, currentRank, rankChange };
            });

            loading = false;
        } catch (error) {
            console.error("Projections Error:", error);
            errorMessage = error.message;
            loading = false;
        }
    });
</script>

<style>
    .proj-container { display: flex; flex-direction: column; gap: 8px; }
    
    .team-row { 
        display: flex; 
        align-items: center; 
        padding: 10px; 
        gap: 10px; 
    }
    
    .rank-change { 
        font-size: 0.8em; 
        font-weight: bold; 
        width: 22px; 
        text-align: center; 
        flex-shrink: 0;
    }
    
    .up { color: var(--barChartSix, #04351e); }
    .down { color: #ef4444; }
    .neutral { color: var(--text-muted); }
    
    .avatar { 
        width: 36px; 
        height: 36px; 
        border-radius: 50%; 
        border: 2px solid var(--accent-secondary); 
        background-color: #111; 
        object-fit: cover; 
        flex-shrink: 0;
    }
    
    /* CRITICAL FIX: min-width 0 forces the flexbox to truncate text instead of expanding */
    .details { 
        flex-grow: 1; 
        display: flex; 
        flex-direction: column; 
        min-width: 0; 
    }
    
    .team-name { 
        font-weight: 700; 
        font-size: 0.9em; 
        color: var(--text-main); 
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis; 
        width: 100%;
    }
    
    .record { 
        font-size: 0.75em; 
        color: var(--text-muted); 
    }
    
    /* Flex-shrink 0 ensures the odds NEVER get squished off screen */
    .odds { 
        text-align: right; 
        font-size: 0.75em; 
        display: flex; 
        flex-direction: column; 
        min-width: 75px; 
        flex-shrink: 0; 
    }
    
    .odds span { 
        color: var(--text-main); 
        font-weight: bold; 
    }

    /* Aggressive mobile scaling */
    @media (max-width: 450px) {
        .team-row { padding: 8px 6px; gap: 6px; }
        .avatar { width: 30px; height: 30px; border-width: 1px; }
        .team-name { font-size: 0.85em; }
        .record { font-size: 0.7em; }
        .odds { font-size: 0.7em; min-width: 60px; }
        .rank-change { width: 16px; font-size: 0.7em; }
    }
</style>

<div class="modern-card" style="padding: 15px;">
    <h3 style="margin-top: 0; text-align: center; font-size: 1.2em;">Live Projections</h3>
    <hr style="border-color: var(--glass-border); margin-bottom: 15px;" />
    
    {#if loading}
        <LinearProgress indeterminate />
    {:else if errorMessage}
        <div style="color: #ef4444; text-align: center; font-size: 0.9em;">
            Error loading projections: {errorMessage}
        </div>
    {:else}
        <div class="proj-container">
            {#each powerRankings as team}
                <div class="team-row modern-card" style="padding: 10px; background: rgba(0,0,0,0.3); backdrop-filter: none;">
                    
                    <div class="rank-change {team.rankChange > 0 ? 'up' : team.rankChange < 0 ? 'down' : 'neutral'}">
                        {#if team.rankChange > 0} +{team.rankChange}
                        {:else if team.rankChange < 0} -{Math.abs(team.rankChange)}
                        {:else} -
                        {/if}
                    </div>
                    <img class="avatar" src="{team.avatar}" alt="Team avatar" />
                    
                    <div class="details">
                        <span class="team-name">{team.teamName}</span>
                        <span class="record">{team.wins} - {team.losses}</span>
                    </div>
                    <div class="odds">
                        <div>PO: <span>{team.playoffOdds}%</span></div>
                        <div>Champ: <span>{team.champOdds}%</span></div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>