<script>
    import { tabs } from '$lib/utils/tabs.js';
    import { goto } from '$app/navigation';
    import { activeLeague, userLeaguesList } from '$lib/stores/leagueContext.js';
    import { supabase } from '$lib/supabaseClient';
    import { slide, fade } from 'svelte/transition';
    import { page } from '$app/stores';

    let { handleLeagueSwitch } = $props();
    
    let showLeagueMenu = $state(false);
    let showSettingsMenu = $state(false);

    function navigate(dest) {
        showLeagueMenu = false;
        showSettingsMenu = false;
        if (dest.startsWith('http')) {
            window.location.href = dest;
        } else {
            goto(dest);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }

    async function removeActiveLeague() {
        if (!$activeLeague) return;
        const confirmed = confirm(`Are you sure you want to remove "${$activeLeague.league_name}" from your account?`);
        if (confirmed) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user) {
                const { error } = await supabase
                    .from('user_leagues')
                    .delete()
                    .eq('user_id', sessionData.session.user.id)
                    .eq('league_id', $activeLeague.id);
                
                if (error) {
                    alert(`Failed to remove league: ${error.message}`);
                } else {
                    window.location.href = '/'; 
                }
            }
        }
    }
</script>

<style>
    /* Force body to accommodate fixed top and bottom bars natively */
    :global(body) {
        padding-top: 60px !important;
        padding-bottom: 85px !important; /* Space for bottom nav */
    }

    /* --- TOP APP BAR --- */
    .top-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(11, 14, 20, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        padding-top: env(safe-area-inset-top);
        z-index: 990;
    }
    
    .league-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 800;
        font-size: 1.1em;
        color: #f8fafc;
        letter-spacing: 0.5px;
    }

    .league-logo {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2px solid var(--accent-secondary, #eebf1c);
        object-fit: cover;
    }

    .settings-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        padding: 8px;
        cursor: pointer;
    }

    /* --- BOTTOM NAV BAR --- */
    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 75px;
        background: rgba(11, 14, 20, 0.95);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding-bottom: env(safe-area-inset-bottom);
        z-index: 1000;
    }

    .nav-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        flex: 1;
        height: 100%;
        color: #64748b;
        cursor: pointer;
        transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        -webkit-tap-highlight-color: transparent;
    }

    .nav-tab.active {
        color: var(--accent-secondary, #eebf1c);
    }

    .nav-icon {
        font-size: 26px;
    }

    .nav-label {
        font-size: 0.65em;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* --- BOTTOM SHEET MENUS --- */
    .scrim {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 995;
    }

    .bottom-sheet {
        position: fixed;
        bottom: calc(75px + env(safe-area-inset-bottom));
        left: 0;
        right: 0;
        background: #161c26;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px 24px 0 0;
        padding: 25px 20px 20px;
        z-index: 999;
        box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
    }

    .sheet-header {
        text-align: center;
        color: #f8fafc;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 20px;
        font-size: 0.9em;
    }

    /* Grid for League Hub Info */
    .hub-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
    }

    .hub-item {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 15px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #e2e8f0;
        cursor: pointer;
        transition: 0.2s;
    }

    .hub-item:active {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--accent-secondary, #eebf1c);
    }

    .hub-item i {
        font-size: 28px;
        color: var(--accent-secondary, #eebf1c);
    }

    .hub-item span {
        font-size: 0.75em;
        font-weight: 600;
        text-align: center;
    }

    /* List for Settings Menu */
    .settings-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .settings-select {
        width: 100%;
        padding: 15px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(238, 191, 28, 0.3);
        border-radius: 12px;
        color: #f8fafc;
        font-size: 1em;
        font-weight: 600;
        outline: none;
        appearance: none;
    }

    .settings-btn-action {
        width: 100%;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        border-radius: 12px;
        color: #f8fafc;
        font-weight: 600;
        font-size: 1em;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .settings-btn-action.danger { color: #ef4444; }
</style>

<!-- TOP BAR -->
<div class="top-bar">
    <div class="league-brand">
        {#if $activeLeague?.logo_url}
            <img src={$activeLeague.logo_url} alt="Logo" class="league-logo"/>
        {/if}
        {$activeLeague?.league_name || 'Huddle'}
    </div>
    <button class="settings-btn" onclick={() => { showSettingsMenu = !showSettingsMenu; showLeagueMenu = false; }}>
        <i class="material-icons">settings</i>
    </button>
</div>

<!-- SCRIM BACKDROP FOR MENUS -->
{#if showLeagueMenu || showSettingsMenu}
    <div class="scrim" transition:fade={{ duration: 200 }} onclick={() => { showLeagueMenu = false; showSettingsMenu = false; }}></div>
{/if}

<!-- LEAGUE INFO BOTTOM SHEET -->
{#if showLeagueMenu}
    <div class="bottom-sheet" transition:slide={{ duration: 250 }}>
        <div class="sheet-header">League Hub</div>
        <div class="hub-grid">
            {#each tabs.find(t => t.nest)?.children || [] as child}
                <div class="hub-item" onclick={() => navigate(child.dest)}>
                    <i class="material-icons">{child.icon}</i>
                    <span>{child.label}</span>
                </div>
            {/each}
        </div>
    </div>
{/if}

<!-- SETTINGS BOTTOM SHEET -->
{#if showSettingsMenu}
    <div class="bottom-sheet" transition:slide={{ duration: 250 }}>
        <div class="sheet-header">Account & Settings</div>
        <div class="settings-list">
            
            <select class="settings-select" onchange={handleLeagueSwitch}>
                <option value="" disabled selected>Switch Active League</option>
                {#each $userLeaguesList as league}
                    <option value={league.id} selected={$activeLeague?.id === league.id}>
                        {league.name} {league.is_commissioner ? '(Commish)' : ''}
                    </option>
                {/each}
                <option value="ADD_NEW">+ Connect Another League</option>
            </select>

            <button class="settings-btn-action" onclick={() => navigate('/settings')}>
                <i class="material-icons">edit</i> Edit Hub Settings
            </button>
            
            <button class="settings-btn-action danger" onclick={removeActiveLeague}>
                <i class="material-icons">delete_outline</i> Disconnect League
            </button>
            
            <button class="settings-btn-action danger" onclick={handleLogout}>
                <i class="material-icons">logout</i> Log Out
            </button>
        </div>
    </div>
{/if}

<!-- BOTTOM NAV BAR -->
<div class="bottom-nav">
    {#each tabs as tab}
        {#if !tab.nest}
            <div class="nav-tab" class:active={$page.url.pathname === tab.dest} onclick={() => navigate(tab.dest)}>
                <i class="material-icons nav-icon">{tab.icon}</i>
                <span class="nav-label">{tab.label}</span>
            </div>
        {:else}
            <!-- League Info Menu Toggle -->
            <div class="nav-tab" class:active={showLeagueMenu} onclick={() => { showLeagueMenu = !showLeagueMenu; showSettingsMenu = false; }}>
                <i class="material-icons nav-icon">{tab.icon}</i>
                <span class="nav-label">{tab.label}</span>
            </div>
        {/if}
    {/each}
</div>