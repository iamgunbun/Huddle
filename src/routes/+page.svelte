<script>
    import { activeLeague } from '$lib/stores/leagueContext.js';
    import { Transactions } from '$lib/components';
    import ProjectionsPanel from '$lib/Projections/ProjectionsPanel.svelte';
    import GlobalChat from '$lib/components/GlobalChat.svelte';
    import Button, { Label } from '@smui/button';
    import { Icon } from '@smui/common';
    import { onMount } from 'svelte';
    import { getAwards, getLeagueTeamManagers } from '$lib/utils/helper';
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import { fade, slide } from 'svelte/transition';

    let copyLinkText = $state('Copy Invite Link');
    let recentChamp = $state(null);
    let teamManagers = $state(null);
    
    // Mobile Detection
    let innerWidth = $state(0);
    let isMobile = $derived(innerWidth <= 1100);
    
    // Pop-in States
    let showProjections = $state(false);
    let showHub = $state(false);

    onMount(async () => {
        try {
            const awardsData = await getAwards();
            const managersData = await getLeagueTeamManagers();
            teamManagers = managersData;
            if (awardsData && awardsData.length > 0) {
                recentChamp = awardsData[0]; 
            }
        } catch (e) {
            console.error("No champion data found yet:", e);
        }
    });

    function copyInviteLink() {
        if (!$activeLeague?.id) return;
        const inviteUrl = `${window.location.origin}/invite/${$activeLeague.id}`;
        navigator.clipboard.writeText(inviteUrl).then(() => {
            copyLinkText = 'Copied!';
            setTimeout(() => copyLinkText = 'Copy Invite Link', 2000);
        });
    }
</script>

<svelte:window bind:innerWidth />

<style>
    .home-container { padding: 30px 20px; max-width: 1400px; margin: 0 auto; }
    
    /* Desktop Grid */
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 30px; align-items: start; }
    .column { display: flex; flex-direction: column; gap: 30px; }
    
    /* Mobile Layout */
    .mobile-layout { display: flex; flex-direction: column; gap: 20px; padding: 10px; }
    .popin-buttons { display: flex; gap: 15px; margin: 10px 0; }
    .popin-btn { flex: 1; padding: 15px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(238,191,28,0.4); color: #f8fafc; font-weight: bold; text-transform: uppercase; font-size: 0.85em; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
    .popin-btn:active { background: rgba(238,191,28,0.15); transform: scale(0.98); }
    .popin-btn i { font-size: 28px; color: #eebf1c; }

    /* Modals / Pop-ins */
    .modal-scrim { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; backdrop-filter: blur(5px); }
    .modal-content { position: fixed; bottom: 0; left: 0; right: 0; background: #0b0e14; border-top: 2px solid #eebf1c; border-radius: 24px 24px 0 0; padding: 25px 20px 40px; z-index: 1001; max-height: 85vh; overflow-y: auto; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
    .close-modal { width: 100%; padding: 15px; background: rgba(255,255,255,0.05); border: none; border-radius: 12px; color: #f8fafc; font-weight: bold; text-transform: uppercase; margin-top: 15px; cursor: pointer; }

    /* Cards */
    .commish-note, .hub-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(238, 191, 28, 0.15); border-radius: 12px; padding: 25px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); }
    .card-header { margin-top: 0; margin-bottom: 20px; font-size: 1.2em; color: var(--accent-secondary); border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.95em; }
    .info-label { color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
    .info-value { color: var(--text-main); font-weight: 600; text-transform: capitalize; }
    
    :global(.full-width) { width: 100% !important; }
</style>

{#if !$activeLeague}
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 70vh; text-align: center;">
        <h1 style="color: #f8fafc; font-size: 2.5em; text-transform: uppercase; font-weight: 900; margin-bottom: 10px;">Welcome to Huddle</h1>
        <p style="color: #94a3b8; font-size: 1.2em; margin-bottom: 30px;">You don't have any active leagues connected to your account.</p>
        <button onclick={() => window.location.href = '/add-league'} style="background: linear-gradient(90deg, #b8860b, #ffd700, #b8860b); color: #000; font-weight: 800; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; text-transform: uppercase;">
            Connect a League
        </button>
    </div>
{:else}
    <div class="home-container">
        
        {#if !isMobile}
            <!-- DESKTOP GRID -->
            <div class="dashboard-grid">
                <div class="column left-column">
                    <ProjectionsPanel />
                </div>
                <div class="column middle-column">
                    <div class="commish-note">
                        <h3 class="card-header">Commissioner's Note</h3>
                        <div style="color: var(--text-main); line-height: 1.6; white-space: pre-wrap;">
                            {$activeLeague?.homepage_text || 'Welcome to your dynasty hub. The commissioner has not set a message yet.'}
                        </div>
                    </div>
                    <Transactions />
                </div>
                <div class="column right-column">
                    <div class="hub-card">
                        <h3 class="card-header" style="color: var(--text-main);">League Hub Info</h3>
                        <div class="info-row">
                            <span class="info-label"><Icon class="material-icons" style="font-size: 1.1em; color: var(--accent-secondary);">sports_football</Icon> Platform</span>
                            <span class="info-value">{$activeLeague?.platform || 'Sleeper'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><Icon class="material-icons" style="font-size: 1.1em; color: var(--accent-secondary);">shield</Icon> Your Role</span>
                            <span class="info-value">{#if $activeLeague?.is_commissioner}<span style="color: var(--accent-secondary);">Commissioner</span>{:else}Manager{/if}</span>
                        </div>
                        <Button variant="outlined" class="full-width" onclick={copyInviteLink} style="border-color: var(--accent-secondary); color: var(--accent-secondary); margin-top: 15px;">
                            <Icon class="material-icons">link</Icon><Label>{copyLinkText}</Label>
                        </Button>
                    </div>
                    {#if recentChamp && teamManagers}
                        {@const champTeam = getTeamFromTeamManagers(teamManagers, recentChamp.champion, recentChamp.year)}
                        <div class="hub-card" style="text-align: center;">
                            <h3 class="card-header" style="border:none; margin-bottom: 0;">{recentChamp.year} Champion</h3>
                            <img src={champTeam.avatar} alt="Champ Avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--accent-secondary); margin: 15px auto; display: block; object-fit: cover;" />
                            <div style="color: var(--accent-secondary); font-size: 1.3em; font-weight: 800; text-transform: uppercase;">{champTeam.name}</div>
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <!-- MOBILE STACKED LAYOUT -->
            <div class="mobile-layout">
                
                <!-- 1. Commish Note Top -->
                <div class="commish-note">
                    <h3 class="card-header">Commissioner's Note</h3>
                    <div style="color: var(--text-main); line-height: 1.6; white-space: pre-wrap; font-size: 0.9em;">
                        {$activeLeague?.homepage_text || 'Welcome to your dynasty hub. The commissioner has not set a message yet.'}
                    </div>
                </div>

                <!-- 2. League Champ -->
                {#if recentChamp && teamManagers}
                    {@const champTeam = getTeamFromTeamManagers(teamManagers, recentChamp.champion, recentChamp.year)}
                    <div class="hub-card" style="text-align: center; display: flex; align-items: center; justify-content: space-between; padding: 15px 20px;">
                        <div style="text-align: left;">
                            <div style="color: var(--text-muted); font-size: 0.8em; text-transform: uppercase; font-weight: 800;">{recentChamp.year} Champion</div>
                            <div style="color: var(--accent-secondary); font-size: 1.1em; font-weight: 800; text-transform: uppercase; margin-top: 4px;">{champTeam.name}</div>
                        </div>
                        <img src={champTeam.avatar} alt="Champ Avatar" style="width: 55px; height: 55px; border-radius: 50%; border: 2px solid var(--accent-secondary); object-fit: cover;" />
                    </div>
                {/if}

                <!-- 3. Pop-in Action Buttons -->
                <div class="popin-buttons">
                    <button class="popin-btn" onclick={() => showProjections = true}>
                        <i class="material-icons">analytics</i> Live Projections
                    </button>
                    <button class="popin-btn" onclick={() => showHub = true}>
                        <i class="material-icons">info</i> League Hub
                    </button>
                </div>

                <!-- 4. Transactions List -->
                <div style="margin-top: 10px;">
                    <Transactions />
                </div>
            </div>

            <!-- MODALS / POP-INS -->
            {#if showProjections}
                <div class="modal-scrim" transition:fade={{duration: 200}} onclick={() => showProjections = false}></div>
                <div class="modal-content" transition:slide={{axis: 'y', duration: 250}}>
                    <ProjectionsPanel />
                    <button class="close-modal" onclick={() => showProjections = false}>Close Projections</button>
                </div>
            {/if}

            {#if showHub}
                <div class="modal-scrim" transition:fade={{duration: 200}} onclick={() => showHub = false}></div>
                <div class="modal-content" transition:slide={{axis: 'y', duration: 250}}>
                    <h3 class="card-header" style="color: var(--text-main);">League Hub Info</h3>
                    <div class="info-row">
                        <span class="info-label"><Icon class="material-icons" style="font-size: 1.1em; color: var(--accent-secondary);">sports_football</Icon> Platform</span>
                        <span class="info-value">{$activeLeague?.platform || 'Sleeper'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><Icon class="material-icons" style="font-size: 1.1em; color: var(--accent-secondary);">shield</Icon> Your Role</span>
                        <span class="info-value">{#if $activeLeague?.is_commissioner}<span style="color: var(--accent-secondary);">Commissioner</span>{:else}Manager{/if}</span>
                    </div>
                    <Button variant="outlined" class="full-width" onclick={copyInviteLink} style="border-color: var(--accent-secondary); color: var(--accent-secondary); margin-top: 15px;">
                        <Icon class="material-icons">link</Icon><Label>{copyLinkText}</Label>
                    </Button>
                    <button class="close-modal" onclick={() => showHub = false}>Close Hub Info</button>
                </div>
            {/if}
        {/if}
    </div>
{/if}

<GlobalChat />