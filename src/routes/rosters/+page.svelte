<script>
    import { activeLeague } from '$lib/stores/leagueContext.js';
    import { getLeagueRosters, getLeagueTeamManagers, getLeagueData, loadPlayers } from '$lib/utils/helper';
    import { Rosters } from '$lib/components';
    import LinearProgress from '@smui/linear-progress';

    let rosterData = $state(null);
    let leagueTeamManagersData = $state(null);
    let leagueData = $state(null);
    let playersInfo = $state(null);
    let loading = $state(true);

    $effect(() => {
        if ($activeLeague?.sleeper_league_id) {
            loading = true;
            Promise.all([
                getLeagueRosters(),
                getLeagueTeamManagers(),
                getLeagueData(),
                loadPlayers() 
            ]).then(([r, m, d, p]) => {
                rosterData = r;
                leagueTeamManagersData = m;
                leagueData = d;
                playersInfo = p;
                loading = false;
            }).catch(e => {
                console.error("Roster layout mount catch:", e);
                loading = false;
            });
        }
    });
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
        text-shadow: 0 2px 10px rgba(238, 191, 28, 0.3);
    }
    .progress-container {
        width: 100%;
        max-width: 400px;
        border-radius: 8px;
        overflow: hidden;
    }
    .error-box {
        text-align: center;
        color: #ef4444;
        margin-top: 100px;
        padding: 40px;
        background: rgba(239, 68, 68, 0.05);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        backdrop-filter: blur(10px);
    }
</style>

<div class="page-container">
    {#if loading}
        <div class="loading-wrapper">
            <div class="loading-text">Loading Rosters...</div>
            <div class="progress-container">
                <LinearProgress indeterminate />
            </div>
        </div>
    {:else if rosterData && leagueTeamManagersData && leagueData && playersInfo}
        <Rosters {rosterData} leagueTeamManagers={leagueTeamManagersData} {leagueTeamManagersData} {leagueData} playersData={playersInfo} {playersInfo} />
    {:else}
        <div class="error-box">
            <h3 style="margin-top: 0; text-transform: uppercase;">Error Loading Rosters</h3>
            <p style="color: #f8fafc; opacity: 0.8;">There was an issue fetching the roster data. Please try switching leagues and back again.</p>
        </div>
    {/if}
</div>