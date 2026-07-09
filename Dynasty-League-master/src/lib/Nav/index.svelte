<script>
    import NavSmall from './NavSmall.svelte';
    import { activeLeague, loadLeagueContext } from '$lib/stores/leagueContext.js';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    
    async function handleLeagueSwitch(event) {
        const selectedId = event.target.value;
        if (selectedId === 'ADD_NEW') { 
            goto('/add-league'); 
            event.target.value = $activeLeague.id || ''; 
            return; 
        }
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
            if (typeof window !== 'undefined') { 
                localStorage.removeItem('transactions'); 
                localStorage.removeItem('records'); 
            }
            
            await loadLeagueContext(sessionData.session.user.id, selectedId);
            window.location.reload();
        }
    }
</script>

<svelte:head>
    <!-- Permanently lock the platform to the dark theme CSS exclusively -->
    <link rel="stylesheet" href="/smui-dark.css" />
</svelte:head>

<style>
    /* Global CSS injection to violently hide any trace of a theme toggle button */
    :global(.theme-btn), 
    :global(#theme-toggle), 
    :global(.theme-toggle), 
    :global([title="Toggle Dark Mode"]) {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        pointer-events: none !important;
    }
    
    /* Ensure the body accommodates the fixed top bar of the new universal mobile nav */
    :global(body) {
        padding-top: 64px !important; 
    }
</style>

<NavSmall {handleLeagueSwitch} />