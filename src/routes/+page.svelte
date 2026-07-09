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

    let copyLinkText = $state('Copy Invite Link');
    let recentChamp = $state(null);
    let teamManagers = $state(null);

    onMount(async () => {
        try {
            // Safely fetch the most recent champion data without relying on external components
            const awardsData = await getAwards();
            const managersData = await getLeagueTeamManagers();
            teamManagers = managersData;

            if (awardsData && awardsData.length > 0) {
                recentChamp = awardsData[0]; // Index 0 is the most recent year
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

<style>

/* Apply this class to your cards, transaction lists, and matchup bars */
.modern-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* Apply to Transaction lists */
.transaction-item {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

    .home-container {
        padding: 30px 20px;
        max-width: 1400px;
        margin: 0 auto;
    }

    .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr 1fr;
        gap: 30px;
        align-items: start;
    }

    .column { display: flex; flex-direction: column; gap: 30px; }

    .commish-note, .hub-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(238, 191, 28, 0.15);
        border-radius: 8px;
        padding: 25px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .card-header {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 1.2em;
        color: var(--accent-secondary);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.95em; }
    .info-label { color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
    .info-value { color: var(--text-main); font-weight: 600; text-transform: capitalize; }
    .invite-section { margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center; }
    .invite-text { font-size: 0.85em; color: var(--text-muted); margin-bottom: 15px; line-height: 1.5; }

    :global(.full-width) { width: 100% !important; }

    @media (max-width: 1100px) {
        .dashboard-grid { grid-template-columns: 1fr 1fr; }
        .right-column { grid-column: span 2; }
    }

    @media (max-width: 768px) {
        .dashboard-grid { grid-template-columns: 1fr; }
        .right-column { grid-column: span 1; }
    }
</style>

{#if !$activeLeague}
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 70vh; text-align: center;">
        <h1 style="color: #f8fafc; font-size: 2.5em; text-transform: uppercase; font-weight: 900; margin-bottom: 10px;">Welcome to Huddle</h1>
        <p style="color: #94a3b8; font-size: 1.2em; margin-bottom: 30px;">You don't have any active leagues connected to your account.</p>
        <button 
            onclick={() => window.location.href = '/add-league'} 
            style="background: linear-gradient(90deg, #b8860b, #ffd700, #b8860b); color: #000; font-weight: 800; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; text-transform: uppercase;">
            Connect a League
        </button>
    </div>
{:else}
    
    {/if}

<div class="home-container">
    <div class="dashboard-grid">
        
        <!-- LEFT SIDE -->
        <div class="column left-column">
            <ProjectionsPanel />
        </div>

        <!-- MIDDLE SIDE -->
        <div class="column middle-column">
            <div class="commish-note">
                <h3 class="card-header">Commissioner's Note</h3>
                <div style="color: var(--text-main); line-height: 1.6; white-space: pre-wrap;">
                    {$activeLeague?.homepage_text || 'Welcome to your dynasty hub. The commissioner has not set a message yet.'}
                </div>
            </div>
            
            <Transactions />
        </div>

        <!-- RIGHT SIDE: Hub Info + Trophy Room -->
        <div class="column right-column">
            <div class="hub-card">
                <h3 class="card-header" style="color: var(--text-main);">League Hub Info</h3>
                
                <div class="info-row">
                    <span class="info-label">
                        <Icon class="material-icons" style="font-size: 1.1em; color: var(--accent-secondary);">sports_football</Icon>
                        Platform
                    </span>
                    <span class="info-value">{$activeLeague?.platform || 'Sleeper'}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">
                        <Icon class="material-icons" style="font-size: 1.1em; color: var(--accent-secondary);">shield</Icon>
                        Your Role
                    </span>
                    <span class="info-value">
                        {#if $activeLeague?.is_commissioner}
                            <span style="color: var(--accent-secondary);">Commissioner</span>
                        {:else}
                            Manager
                        {/if}
                    </span>
                </div>

                <div class="invite-section">
                    <p class="invite-text">
                        Want to bring your league mates into the Huddle? Copy the secure invite link below to let them claim their team and join the chat.
                    </p>
                    <Button variant="outlined" class="full-width" onclick={copyInviteLink} style="border-color: var(--accent-secondary); color: var(--accent-secondary);">
                        <Icon class="material-icons">link</Icon>
                        <Label>{copyLinkText}</Label>
                    </Button>
                </div>
            </div>
            
            <!-- NATIVE TROPHY ROOM -->
            {#if recentChamp && teamManagers}
                {@const champTeam = getTeamFromTeamManagers(teamManagers, recentChamp.champion, recentChamp.year)}
                <div class="hub-card" style="text-align: center;">
                    <h3 class="card-header" style="border:none; margin-bottom: 0;">🏆 {recentChamp.year} Champion</h3>
                    <img src={champTeam.avatar} alt="Champ Avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--accent-secondary); margin: 15px auto; display: block;" />
                    <div style="color: var(--accent-secondary); font-size: 1.3em; font-weight: 800; text-transform: uppercase;">
                        {champTeam.name}
                    </div>
                </div>
            {/if}
        </div>

    </div>
</div>

<GlobalChat />