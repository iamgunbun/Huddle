<script>
    import LinearProgress from '@smui/linear-progress';
    import { Records } from '$lib/components';

    export let data;
    const recordsInfo = data.recordsInfo;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
        width: 100%; /* Restores native width mapping */
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

<div id="main">
    {#await recordsInfo}
        <div class="loading-wrapper">
            <div class="loading-text">Loading League Records...</div>
            <div class="progress-container">
                <LinearProgress indeterminate />
            </div>
        </div>
    {:then [leagueData, {totals, stale}, leagueTeamManagers]}
        <Records {leagueData} {totals} {stale} {leagueTeamManagers} />
    {:catch error}
        <div class="error-box">
            <h3 style="margin-top: 0; text-transform: uppercase;">Error Loading Records</h3>
            <p style="color: #f8fafc; opacity: 0.8;">{error.message}</p>
        </div>
    {/await}
</div>
