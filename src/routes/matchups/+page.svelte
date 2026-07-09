<script>
    import { activeLeague } from '$lib/stores/leagueContext.js';
    import { getLeagueMatchups, getLeagueTeamManagers, getBrackets, loadPlayers } from '$lib/utils/helper';
    import { MatchupsAndBrackets } from '$lib/components';
    import LinearProgress from '@smui/linear-progress';

    let matchupsData = $state(null);
    let leagueTeamManagersData = $state(null);
    let bracketsData = $state(null);
    let playersInfo = $state(null);
    let loading = $state(true);

    $effect(() => {
        if ($activeLeague?.sleeper_league_id) {
            loading = true;
            Promise.all([
                getLeagueMatchups(),
                getLeagueTeamManagers(),
                getBrackets().catch(() => null),
                loadPlayers()
            ]).then(([m, tm, b, p]) => {
                matchupsData = m;
                leagueTeamManagersData = tm;
                bracketsData = b;
                playersInfo = p;
                loading = false;
            }).catch(e => {
                console.error("Matchups layout mount catch:", e);
                loading = false;
            });
        }
    });
</script>

{#if loading}
    <div style="display: flex; justify-content: center; align-items: center; height: 50vh; flex-direction: column;">
        <div style="color: var(--accent-secondary, #eebf1c); font-size: 1.2em; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
            Loading Matchups...
        </div>
        <div style="width: 80%; max-width: 400px;">
            <LinearProgress indeterminate />
        </div>
    </div>
{:else if matchupsData?.matchupWeeks?.length > 0 && leagueTeamManagersData && playersInfo}
    <MatchupsAndBrackets {matchupsData} leagueTeamManagers={leagueTeamManagersData} {leagueTeamManagersData} {bracketsData} playersData={playersInfo} {playersInfo} />
{:else}
    <div style="text-align: center; margin-top: 100px; color: var(--text-muted);">
        <h3 style="color: var(--text-main);">No Matchups Available</h3>
        <p>Sleeper has not generated schedule data for this league year yet.</p>
    </div>
{/if}