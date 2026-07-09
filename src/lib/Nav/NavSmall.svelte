<script>
    import Drawer, { AppContent, Content, Header, Title } from '@smui/drawer';
    import List, { Item, Text, Graphic, Separator } from '@smui/list';
    import TopAppBar, { Row, Section } from '@smui/top-app-bar';
    import IconButton from '@smui/icon-button';
    import { tabs } from '$lib/utils/tabs.js';
    import { goto } from '$app/navigation';
    import { activeLeague, userLeaguesList } from '$lib/stores/leagueContext.js';
    import { supabase } from '$lib/supabaseClient';

    let { handleLeagueSwitch } = $props();
    
    let drawerOpen = $state(false);

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }

    function navigate(dest) {
        if (dest.startsWith('http')) {
            window.location.href = dest;
        } else {
            goto(dest);
            drawerOpen = false;
        }
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

<svelte:head>
    <link rel="stylesheet" href="/smui-dark.css" />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;800;900&display=swap" rel="stylesheet">
</svelte:head>

<style>
    :global(button.mdc-icon-button),
    :global(.mdc-icon-button .material-icons) {
        font-family: 'Material Icons' !important;
        font-weight: normal !important;
        text-transform: none !important;
        letter-spacing: normal !important;
        font-size: 28px !important; 
        line-height: 1 !important;
    }

    .left-controls {
        display: flex;
        align-items: center;
        gap: 15px;
        padding-left: 10px;
        padding-top: 15px; 
        z-index: 20;
    }

    .league-select {
        background: rgba(0, 0, 0, 0.5);
        color: #f8fafc;
        border: 1px solid rgba(238, 191, 28, 0.3);
        border-radius: 8px;
        padding: 8px 12px;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.85em;
        font-weight: 500;
        text-transform: uppercase;
        outline: none;
        cursor: pointer;
        backdrop-filter: blur(5px);
        max-width: 150px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transition: all 0.2s;
    }
    .league-select:hover {
        border-color: rgba(238, 191, 28, 0.8);
    }
    .league-select option {
        background: #0b0e14;
        color: #f8fafc;
        font-weight: 600;
    }

    .delete-btn {
        background: transparent;
        border: none;
        color: #ef4444;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 50%;
        transition: transform 0.2s, background-color 0.2s;
        margin-left: -5px;
    }
    .delete-btn:hover {
        background-color: rgba(239, 68, 68, 0.1);
        transform: scale(1.1);
    }

    .center-brand {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 20px; 
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        gap: 10px;
        z-index: 10;
        text-align: center;
        width: max-content;
    }

    .header-logo {
        height: 85px; 
        width: 85px;  
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--accent-secondary, #eebf1c);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
        background-color: #111;
    }

    .header-text {
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        color: #f8fafc;
        letter-spacing: 3px;
        text-transform: uppercase;
        font-size: 1.4em; 
        text-shadow: 0 4px 10px rgba(0,0,0,0.8);
        line-height: 1;
    }

    :global(.mdc-drawer) {
        background: #0b0e14 !important;
        border-right: 1px solid var(--glass-border) !important;
        box-shadow: 4px 0 20px rgba(0,0,0,0.5);
        z-index: 1000 !important;
    }
    
    :global(.mdc-drawer__header) {
        position: sticky !important;
        top: 0 !important;
        background: #0b0e14 !important;
        z-index: 10 !important;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        padding: 15px !important;
    }
    .drawer-header-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    :global(.mdc-drawer-scrim) { z-index: 999 !important; }
    :global(.mdc-top-app-bar) { z-index: 998 !important; }
    :global(.mdc-drawer .mdc-list-item) { color: #f8fafc !important; }
    :global(.mdc-drawer .mdc-list-item__graphic) { color: var(--accent-secondary) !important; }
    :global(.mdc-drawer__title), :global(.mdc-drawer__subtitle) {
        color: #f8fafc !important;
        font-family: 'Montserrat', sans-serif !important;
    }
    
    :global(body) { padding-top: 165px !important; }
    :global(.custom-top-bar.mdc-top-app-bar) { height: 150px !important; }
    :global(.custom-row) { height: 100% !important; position: relative; }

    @media (max-width: 600px) {
        .header-logo { height: 60px; width: 60px; }
        .header-text { font-size: 1.1em; letter-spacing: 2px; }
        .league-select { max-width: 90px; padding: 6px; font-size: 0.7em; }
        .left-controls { gap: 8px; padding-left: 5px; padding-top: 10px; }
        :global(body) { padding-top: 135px !important; }
        :global(.custom-top-bar.mdc-top-app-bar) { height: 120px !important; }
    }
</style>

<TopAppBar class="custom-top-bar" variant="fixed" style="background: rgba(11, 14, 20, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid var(--glass-border);">
    
    <div class="center-brand" onclick={() => navigate('/')}>
        {#if $activeLeague?.logo_url}
            <img src={$activeLeague.logo_url} alt="League Logo" class="header-logo" />
        {/if}
        <span class="header-text">{$activeLeague?.league_name || 'Huddle'}</span>
    </div>

    <Row class="custom-row">
        <!-- Left Controls Only -->
        <Section align="start" style="align-items: flex-start; height: 100%;">
            <div class="left-controls">
                <IconButton class="material-icons" onclick={() => drawerOpen = !drawerOpen} style="color: var(--accent-secondary);">menu</IconButton>
                <select class="league-select" value={$activeLeague?.id || ''} onchange={handleLeagueSwitch}>
                    <option value="" disabled>Switch</option>
                    {#each $userLeaguesList as league}
                        <option value={league.id}>{league.name}</option>
                    {/each}
                    <option value="ADD_NEW">+ Add New</option>
                </select>

                {#if $activeLeague}
                    <button class="delete-btn" onclick={removeActiveLeague} title="Remove Active League">
                        <span class="material-icons">delete</span>
                    </button>
                {/if}
            </div>
        </Section>
    </Row>
</TopAppBar>

<Drawer variant="modal" bind:open={drawerOpen}>
    <Header>
        <div class="drawer-header-content">
            <IconButton class="material-icons" onclick={() => drawerOpen = false} style="color: var(--accent-secondary); margin: 0;">menu</IconButton>
            <div class="drawer-titles">
                <Title style="font-weight: 800; text-transform: uppercase; margin: 0;">{$activeLeague?.league_name || 'Menu'}</Title>
            </div>
        </div>
    </Header>
    <Content>
        <List>
            {#each tabs as tab}
                {#if !tab.nest && tab.label !== 'League Chat'}
                    <Item href="javascript:void(0)" onSMUIAction={() => navigate(tab.dest)}>
                        <Graphic class="material-icons" aria-hidden="true">{tab.icon}</Graphic>
                        <Text>{tab.label}</Text>
                    </Item>
                {/if}
            {/each}
            
            {#each tabs as tab}
                {#if tab.nest}
                    <Separator />
                    <div style="color: var(--accent-secondary); font-size: 0.85em; font-weight: bold; padding: 15px 15px 5px; text-transform: uppercase;">{tab.label}</div>
                    {#each tab.children as subTab}
                        <Item href="javascript:void(0)" onSMUIAction={() => navigate(subTab.dest)}>
                            <Graphic class="material-icons" aria-hidden="true">{subTab.icon}</Graphic>
                            <Text>{subTab.label}</Text>
                        </Item>
                    {/each}
                {/if}
            {/each}

            <Separator />
            <div style="color: var(--text-muted); font-size: 0.85em; font-weight: bold; padding: 15px 15px 5px; text-transform: uppercase;">Account</div>
            <Item href="javascript:void(0)" onSMUIAction={() => navigate('/settings')}>
                <Graphic class="material-icons" aria-hidden="true">settings</Graphic>
                <Text>Settings</Text>
            </Item>
            <Item href="javascript:void(0)" onSMUIAction={handleLogout}>
                <Graphic class="material-icons" aria-hidden="true" style="color: #ff2a6d !important;">logout</Graphic>
                <Text style="color: #ff2a6d !important;">Log Out</Text>
            </Item>
            
            <div style="height: 120px;"></div>
        </List>
    </Content>
</Drawer>

<AppContent>
    <slot />
</AppContent>