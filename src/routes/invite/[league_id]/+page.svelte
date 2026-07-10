<script>
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { loadLeagueContext } from '$lib/stores/leagueContext';
    import Button, { Label } from '@smui/button';

    // Data is automatically passed from +page.js
    let { data } = $props();
    let { leagueDetails, leagueId } = data;

    let user = $state(null);
    let claiming = $state(false);
    let email = $state('');
    let password = $state('');
    let isLogin = $state(true);
    let authError = $state('');

    onMount(async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        user = sessionData?.session?.user;
    });

    async function handleAuth() {
        authError = '';
        if (isLogin) {
            const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) authError = error.message;
            else user = authData.user;
        } else {
            const { data: authData, error } = await supabase.auth.signUp({ email, password });
            if (error) authError = error.message;
            else user = authData.user;
        }
    }

    async function claimSpot() {
        claiming = true;
        const { error } = await supabase.from('user_leagues').upsert({
            user_id: user.id,
            league_id: leagueId,
            is_commissioner: false
        });
        if (!error) {
            await loadLeagueContext(user.id, leagueId);
            window.location.href = '/'; 
        } else {
            authError = "Failed to claim spot. " + error.message;
            claiming = false;
        }
    }
</script>

<!-- ... Keep your existing <style> and HTML template here ... -->
<!-- Just ensure you use leagueDetails and leagueId from the 'data' prop -->