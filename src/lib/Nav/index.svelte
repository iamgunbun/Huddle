<script>
    import { tabs } from '$lib/utils/tabs.js';
    import { goto } from '$app/navigation';
    import { activeLeague, userLeaguesList } from '$lib/stores/leagueContext.js';
    import { supabase } from '$lib/supabaseClient';
    import { page } from '$app/stores';
    import { slide, fade } from 'svelte/transition';

    let innerWidth = 0;
    $: isMobile = innerWidth <= 768;

    let drawerOpen = false;
    let mobileSubMenuOpen = false;

    function navigate(dest) {
        drawerOpen = false;
        mobileSubMenuOpen = false;
        if (dest.startsWith('http')) {
            window.location.href = dest;
        } else {
            goto(dest);
        }
    }

    async function handleLeagueSwitch(selectedId) {
        if (selectedId === 'ADD_NEW') {
            goto('/add-league');
            return;
        }
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('transactions');
                localStorage.removeItem('records');
            }
            const { loadLeagueContext } = await import('$lib/stores/leagueContext.js');
            await loadLeagueContext(sessionData.session.user.id, selectedId);
            window.location.reload();
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }
</script>

<svelte:window bind:innerWidth />

<style>
    /* Reset body padding to support Top Nav natively */
    :global(body) {
        padding-top: 60px !important;
        padding-bottom: 0 !important; 
    }

    @media (max-width: 768px) {
        :global(body) {
            padding-top: 105px !important; /* 60px header + 45px tabs */
        }
    }

    /* TOP HEADER */
    .top-header {
        position: fixed; top: 0; left: 0; right: 0; height: 60px;
        background: #0b0e14; border-bottom: 1px solid rgba(238,191,28,0.2);
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 15px; z-index: 990;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    
    .header-left { display: flex; align-items: center; gap: 15px; }
    .menu-btn { background: transparent; border: none; color: #f8fafc; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; color: #f8fafc; font-size: 1.1em; text-transform: uppercase; letter-spacing: 1px; }
    .brand-logo { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #eebf1c; object-fit: cover; }

    /* MOBILE HORIZONTAL TABS (Options at the Top) */
    .mobile-tabs {
        position: fixed; top: 60px; left: 0; right: 0; height: 45px;
        background: rgba(11,14,20,0.98); border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex; overflow-x: auto; white-space: nowrap; align-items: center; z-index: 980;
        scrollbar-width: none; -ms-overflow-style: none;
    }
    .mobile-tabs::-webkit-scrollbar { display: none; }
    
    .m-tab {
        padding: 0 15px; color: #94a3b8; font-weight: 600; font-size: 0.85em; text-transform: uppercase;
        letter-spacing: 0.5px; display: flex; align-items: center; height: 100%; cursor: pointer;
    }
    .m-tab.active { color: #eebf1c; border-bottom: 2px solid #eebf1c; }
    
    .mobile-dropdown {
        position: fixed; top: 105px; left: 0; right: 0; background: #161c26;
        border-bottom: 1px solid rgba(238,191,28,0.3); z-index: 975;
        box-shadow: 0 10px 20px rgba(0,0,0,0.5);
    }
    .m-dropdown-item {
        padding: 15px 20px; display: flex; align-items: center; gap: 15px;
        color: #f8fafc; font-weight: 600; font-size: 0.9em; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;
    }
    .m-dropdown-item:active { background: rgba(238,191,28,0.1); }

    /* SIDE DRAWER */
    .scrim { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 995; }
    .drawer { 
        position: fixed; top: 0; bottom: 0; left: 0; width: 280px; max-width: 85vw; 
        background: #0b0e14; z-index: 1000; box-shadow: 5px 0 25px rgba(0,0,0,0.5); 
        display: flex; flex-direction: column; overflow-y: auto; border-right: 1px solid rgba(238,191,28,0.2); 
    }
    .drawer-header { padding: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .drawer-header h3 { margin: 0; color: #eebf1c; text-transform: uppercase; font-size: 1.1em; letter-spacing: 1px; }
    .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    
    .drawer-content { padding: 15px 0; }
    .section-title { padding: 10px 20px; font-size: 0.75em; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
    .drawer-item { padding: 12px 20px; display: flex; align-items: center; gap: 15px; color: #f8fafc; font-weight: 600; cursor: pointer; font-size: 0.95em; transition: 0.2s; }
    .drawer-item:hover, .drawer-item.active { background: rgba(238,191,28,0.1); color: #eebf1c; }
    .drawer-item .material-icons { font-size: 20px; color: inherit; }
    .drawer-item.sub { padding-left: 55px; font-size: 0.85em; color: #94a3b8; }
    .drawer-item.sub:hover { color: #f8fafc; }
    .drawer-item.danger { color: #ef4444; }
    .drawer-item.danger:hover { background: rgba(239,68,68,0.1); }
    .drawer-divider { border: 0; height: 1px; background: rgba(255,255,255,0.05); margin: 10px 0; }
</style>

<!-- TOP HEADER -->
<div class="top-header">
    <div class="header-left">
        <button class="menu-btn" onclick={() => drawerOpen = !drawerOpen}>
            <i class="material-icons">menu</i>
        </button>
        <div class="brand">
            {#if $activeLeague?.logo_url}
                <img src={$activeLeague.logo_url} alt="Logo" class="brand-logo"/>
            {/if}
            <span class="brand-name">{$activeLeague?.league_name || 'Huddle'}</span>
        </div>
    </div>
</div>

<!-- MOBILE TABS -->
{#if isMobile}
    <div class="mobile-tabs">
        {#each tabs as tab}
            {#if !tab.nest}
                <div class="m-tab" class:active={$page.url.pathname === tab.dest} onclick={() => navigate(tab.dest)}>
                    {tab.label}
                </div>
            {:else}
                <div class="m-tab" class:active={mobileSubMenuOpen} onclick={() => mobileSubMenuOpen = !mobileSubMenuOpen}>
                    {tab.label} <i class="material-icons" style="font-size:14px; margin-left: 4px;">arrow_drop_down</i>
                </div>
            {/if}
        {/each}
    </div>
    
    {#if mobileSubMenuOpen}
        <div class="mobile-dropdown" transition:slide={{duration: 200}}>
            {#each tabs.find(t => t.nest)?.children || [] as child}
                <div class="m-dropdown-item" onclick={() => navigate(child.dest)}>
                    <i class="material-icons">{child.icon}</i> {child.label}
                </div>
            {/each}
        </div>
    {/if}
{/if}

<!-- LEFT DRAWER -->
{#if drawerOpen}
    <div class="scrim" transition:fade={{duration: 200}} onclick={() => drawerOpen = false}></div>
    <div class="drawer" transition:slide={{axis: 'x', duration: 250}}>
        <div class="drawer-header">
            <h3>{isMobile ? 'Your Leagues' : 'Navigation'}</h3>
            <button class="close-btn" onclick={() => drawerOpen = false}><i class="material-icons">close</i></button>
        </div>

        <div class="drawer-content">
            <!-- Show Main Navigation on Desktop only -->
            {#if !isMobile}
                <div class="drawer-section">
                    <div class="section-title">Menu</div>
                    {#each tabs as tab}
                        {#if !tab.nest}
                            <div class="drawer-item" class:active={$page.url.pathname === tab.dest} onclick={() => navigate(tab.dest)}>
                                <i class="material-icons">{tab.icon}</i> {tab.label}
                            </div>
                        {:else}
                            <div class="drawer-item" style="opacity: 0.6; cursor: default;">
                                <i class="material-icons">{tab.icon}</i> {tab.label}
                            </div>
                            <div class="drawer-sub">
                                {#each tab.children as child}
                                    <div class="drawer-item sub" onclick={() => navigate(child.dest)}>
                                        {child.label}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    {/each}
                </div>
                <hr class="drawer-divider" />
            {/if}

            <!-- LEAGUES SECTION (Shows on both, primary focus on mobile) -->
            <div class="drawer-section">
                <div class="section-title">Switch League</div>
                {#each $userLeaguesList as league}
                    <div class="drawer-item" class:active={$activeLeague?.id === league.id} onclick={() => handleLeagueSwitch(league.id)}>
                        <i class="material-icons">{$activeLeague?.id === league.id ? 'radio_button_checked' : 'radio_button_unchecked'}</i>
                        {league.name}
                    </div>
                {/each}
                <div class="drawer-item" onclick={() => handleLeagueSwitch('ADD_NEW')}>
                    <i class="material-icons">add_circle_outline</i> Connect League
                </div>
            </div>

            <hr class="drawer-divider" />

            <!-- SETTINGS & LOGOUT -->
            <div class="drawer-section">
                <div class="drawer-item" onclick={() => navigate('/settings')}>
                    <i class="material-icons">settings</i> Settings
                </div>
                <div class="drawer-item danger" onclick={handleLogout}>
                    <i class="material-icons">logout</i> Log Out
                </div>
            </div>
        </div>
    </div>
{/if}