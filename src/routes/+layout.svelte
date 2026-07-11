<script>
    import '../app.css';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { loadLeagueContext, activeLeague } from '$lib/stores/leagueContext.js';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { fly, fade } from 'svelte/transition';

    import { Nav } from '$lib/components';
    import GlobalChat from '$lib/components/GlobalChat.svelte';

    let loading = true;
    let session = null;
    onMount(async () => {
        const { data } = await supabase.auth.getSession();
        session = data.session;
        if (session) {
            await loadLeagueContext(session.user.id);
        } else if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/invite')) {
            goto('/login');
        }
        loading = false;
        supabase.auth.onAuthStateChange(async (_event, _session) => {
            session = _session;
            if (session) {
                await loadLeagueContext(session.user.id);
            } else if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/invite')) {
                goto('/login');
            }
        });
    });
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

{#if loading}
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; color: #f8fafc; font-family: 'Montserrat', sans-serif; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
        Loading Configuration...
    </div>
{:else}
    <div class="app-wrapper" style="--accent-primary: {$activeLeague?.theme_settings?.primary_color || '#0b0e14'}; --accent-secondary: {$activeLeague?.theme_settings?.secondary_color || '#eebf1c'};">
        
        {#if session && $page.url.pathname !== '/login' && !$page.url.pathname.startsWith('/invite')}
            <Nav />
        {/if}
        <main class="content">
            {#key $page.url.pathname}
                <div 
                    in:fly={{ x: 50, duration: 250, delay: 100 }} 
                    out:fade={{ duration: 100 }}
                    style="width: 100%; height: 100%;"
                >
                    <slot />
                </div>
            {/key}
        </main>
        {#if session && $page.url.pathname !== '/login' && !$page.url.pathname.startsWith('/invite')}
            <GlobalChat />
        {/if}
    </div>
{/if}

<style>
    /* =================================================================
       GLOBAL SLEEKNESS & SEAMLESS BACKGROUND OVERRIDES 
    ================================================================= */
    
    :global(html), :global(body) { 
        margin: 0; 
        padding: 0;
        min-height: 100vh; 
        overflow-x: hidden; 
        background: radial-gradient(circle at top right, #1a2332 0%, #0b0e14 80%) !important;
        background-attachment: fixed !important; 
        color: #f8fafc !important; 
        font-family: 'Montserrat', sans-serif !important;
    }
    
    :global(button) {
        font-family: 'Montserrat', sans-serif !important;
        font-weight: 500 !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
    }

    .app-wrapper { 
        min-height: 100vh; 
        display: flex; 
        flex-direction: column; 
        background: transparent !important; 
    }
    
    .content { 
        flex: 1; 
        padding-bottom: 20px; 
        overflow-x: hidden; /* Prevents scrollbars during page sliding */
    }
    
    :global(.bar) {
        background: linear-gradient(90deg, rgba(238, 191, 28, 0.7), rgba(238, 191, 28, 1)) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 15px rgba(238, 191, 28, 0.15) !important;
        border: 1px solid rgba(238, 191, 28, 0.3) !important;
        height: 28px !important;
        transition: 0.3s;
    }
    :global(.bar.opponent) {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.15)) !important;
        border-color: rgba(255,255,255,0.1) !important;
        box-shadow: none !important;
    }
    :global(.transaction), :global(.tradeTransaction), :global(.waiverTransaction), :global(.transaction-item) {
        background: rgba(255, 255, 255, 0.02) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(238, 191, 28, 0.15) !important;
        border-radius: 16px !important;
        padding: 20px !important;
        margin-bottom: 20px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        color: #f8fafc !important;
    }
    /* Golden Borders for ALL Cards */
    :global(.roster), :global(.standings-row), :global(.record-card), :global(.league-info-container),
    :global(.record-table), :global(.leaderboard-container), :global(.draft-board-container), :global(.draft-container) {
        background: rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(238, 191, 28, 0.4) !important; 
        border-radius: 12px !important;
        backdrop-filter: blur(10px) !important;
        box-shadow: 0 4px 20px rgba(238, 191, 28, 0.1) !important; 
        padding: 20px !important;
        margin-bottom: 15px !important;
    }
    /* =================================================================
       PAGE SPECIFIC FIXES (RECORDS & DRAFTS)
    ================================================================= */
    /* 1. Records Table Spacing Compression */
    :global(.record-table td), :global(.record-table th) {
        padding: 10px 15px !important; /* Drastically reduces the massive gaps */
        vertical-align: middle !important;
        border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        line-height: 1.2 !important; /* Pulls the "vs" closer to the names */
    }
    :global(.record-table td > div) {
        margin: 4px 0 !important; /* Compresses nested items inside the records */
    }
    /* 2. Draft Board Centering & Size Overrides */
    :global(.draft-board) {
        min-height: 75vh !important; 
        border: 1px solid rgba(238, 191, 28, 0.4) !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(238, 191, 28, 0.1) !important;
    }
    
    /* CRITICAL FIX: Pins everything to the top and limits width */
    :global(.draft-board th), :global(.draft-board .header-cell) {
        text-align: center !important;
        vertical-align: top !important; 
        padding: 15px 5px !important;
        max-width: 90px !important; 
    }
    
    :global(.draft-board th img), :global(.draft-board th .avatar) {
        margin: 0 auto 8px auto !important; 
        display: block !important;
    }
    
    /* CRITICAL FIX: Forces text onto one line to stop row stretching */
    :global(.draft-board th span), :global(.draft-board th div), :global(.draft-board th p) {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        font-size: 0.85em !important;
        margin: 0 !important;
    }
    /* General Table Typography */
    :global(td), :global(th) {
        color: #f8fafc !important;
    }
</style>