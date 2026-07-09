<script>
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import { loadLeagueContext } from '$lib/stores/leagueContext.js';
    import Button, { Label } from '@smui/button';
    import Textfield from '@smui/textfield';

    // Wizard State
    let step = 1; // 1: Platform Selection, 2: League Sync
    let loading = false;
    let errorMessage = '';

    // Sleeper Fetch Data
    let sleeperUsername = '';
    let availableLeagues = [];
    let selectedLeagueId = '';
    let selectedLeagueName = '';

    // Step 1: Query Sleeper API for 2026 Leagues
    async function fetchSleeperLeagues() {
        loading = true;
        errorMessage = '';
        availableLeagues = [];

        try {
            // 1. Resolve username to Sleeper User ID
            const userRes = await fetch(`https://api.sleeper.app/v1/user/${sleeperUsername.trim()}`);
            const userData = await userRes.json();
            
            if (!userData || !userData.user_id) {
                throw new Error("Sleeper username not found. Please verify spelling.");
            }

            const sleeperUserId = userData.user_id;

            // 2. Pull active 2026 NFL leagues
            const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${sleeperUserId}/leagues/nfl/2026`);
            const leaguesData = await leaguesRes.json();

            if (!leaguesData || leaguesData.length === 0) {
                throw new Error("No active 2026 leagues found for this username.");
            }

            availableLeagues = leaguesData;
        } catch (error) {
            errorMessage = error.message;
        }

        loading = false;
    }

    function selectLeague(league) {
        selectedLeagueId = league.league_id;
        selectedLeagueName = league.name;
    }

    // Step 2: Insert League & Map Junction Table
    async function handleAddLeague() {
        loading = true;
        errorMessage = '';

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData?.session?.user;

            if (!user) {
                throw new Error("User session not found. Please log in again.");
            }

            // 1. Insert the new league tenant
            const { data: leagueData, error: leagueError } = await supabase
                .from('leagues')
                .insert({
                    sleeper_league_id: selectedLeagueId,
                    platform: 'sleeper',
                    league_name: selectedLeagueName,
                    owner_id: user.id
                })
                .select()
                .single();

            if (leagueError) throw leagueError;

            // 2. Link this league to the user via the junction table
            const { error: junctionError } = await supabase
                .from('user_leagues')
                .insert({
                    user_id: user.id,
                    league_id: leagueData.id,
                    is_commissioner: true, // Defaulting as commissioner for added leagues
                    team_name: 'Commissioner Team'
                });

            if (junctionError) throw junctionError;

            // 3. Reload context targeting the newly added league and route home
            await loadLeagueContext(user.id, leagueData.id);
            goto('/');

        } catch (error) {
            errorMessage = error.message;
        } finally {
            loading = false;
        }
    }
</script>

<style>
    .page-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 85vh;
        padding: 20px;
    }
    .wizard-card {
        width: 100%;
        max-width: 500px;
        border-top: 4px solid var(--accent-secondary, #eebf1c);
    }
    
    /* CRITICAL FIX: Expanded line-height and padding-bottom to prevent descender clipping */
    h2 {
        text-align: center;
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.4; 
        padding-bottom: 5px; 
    }
    
    .subtitle {
        color: var(--text-muted, #94a3b8);
        font-size: 0.9em;
        text-align: center;
        margin-bottom: 30px;
    }
    .input-group {
        margin-bottom: 20px;
    }
    :global(.full-width) {
        width: 100% !important;
    }
    .error {
        color: #ef4444;
        font-size: 0.85rem;
        margin-bottom: 15px;
        text-align: center;
        font-weight: 500;
    }
    .platform-btn {
        width: 100%;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
        border-radius: 8px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 15px;
        font-size: 0.95em;
        font-weight: 600;
        line-height: 1.2;
        transition: 0.2s;
    }
    .platform-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--accent-secondary, #eebf1c);
    }
    .platform-btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .league-list {
        max-height: 230px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
        padding-right: 5px;
    }
    .league-item {
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
        border-radius: 6px;
        color: white;
        cursor: pointer;
        text-align: left;
        transition: 0.2s;
    }
    .league-item:hover {
        border-color: var(--text-muted);
    }
    .league-item.selected {
        border-color: var(--accent-secondary, #eebf1c);
        background: rgba(238, 191, 28, 0.08);
    }
    .action-container {
        margin-top: 25px;
        display: flex;
        gap: 15px;
    }
    .btn-secondary {
        background: transparent;
        border: 1px solid var(--glass-border);
        color: var(--text-main);
        border-radius: 8px;
        padding: 12px 20px;
        cursor: pointer;
        font-weight: 600;
        transition: 0.2s;
    }
    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--text-muted);
    }
</style>

<div class="page-container">
    <div class="modern-card wizard-card">
        {#if step === 1}
            <h2>Connect Additional League</h2>
            <p class="subtitle">Select the platform hosting your fantasy league</p>

            <button class="platform-btn" onclick={() => step = 2}>
                <img src="/sleeper.png" style="width: 28px; object-fit: contain;" alt="Sleeper" />
                Sleeper Platform
            </button>

            <button class="platform-btn disabled" disabled>
                Yahoo Fantasy (Coming Soon)
            </button>
            <button class="platform-btn disabled" disabled>
                NFL Fantasy (Coming Soon)
            </button>
            
            <div class="action-container">
                <button class="btn-secondary full-width" onclick={() => goto('/')}>Cancel</button>
            </div>

        {:else if step === 2}
            <h2>Sync Sleeper Data</h2>
            <p class="subtitle">Import an active 2026 league configuration</p>

            {#if availableLeagues.length === 0}
                <div class="input-group" style="display: flex; gap: 10px;">
                    <Textfield variant="outlined" bind:value={sleeperUsername} label="Sleeper Username" class="full-width" />
                    <button onclick={fetchSleeperLeagues} disabled={loading} class="btn-primary">
                        <Label>{loading ? '...' : 'Search'}</Label>
                    </button>
                </div>
            {:else}
                <p style="font-size: 0.9em; margin-bottom: 10px; color: var(--text-muted);">Select a league to add:</p>
                <div class="league-list">
                    {#each availableLeagues as league}
                        <button class="league-item {selectedLeagueId === league.league_id ? 'selected' : ''}" 
                                onclick={() => selectLeague(league)}>
                            <strong>{league.name}</strong> <br/>
                            <span style="font-size: 0.8em; color: var(--text-muted);">{league.total_rosters} Teams</span>
                        </button>
                    {/each}
                </div>
            {/if}

            {#if errorMessage}<p class="error">{errorMessage}</p>{/if}

            <div class="action-container">
                <button class="btn-secondary" onclick={() => { availableLeagues = []; step = 1; selectedLeagueId = ''; }}>Back</button>
                {#if selectedLeagueId}
                    <button onclick={handleAddLeague} disabled={loading} class="btn-primary full-width">
                        <Label>{loading ? 'Linking...' : 'Confirm & Sync'}</Label>
                    </button>
                {/if}
            </div>
        {/if}
    </div>
</div>