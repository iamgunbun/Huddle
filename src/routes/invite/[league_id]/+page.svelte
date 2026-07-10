<script>
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { loadLeagueContext } from '$lib/stores/leagueContext';
    import Button, { Label } from '@smui/button';

    let { data } = $props();
    
    // Safety check to ensure we have data
    let leagueDetails = data?.leagueDetails || null;
    let leagueId = data?.leagueId || null;

    console.log("Page rendered with leagueDetails:", leagueDetails);

    let user = $state(null);
    let claiming = $state(false);
    let email = $state('');
    let password = $state('');
    let isLogin = $state(true);
    let authError = $state('');

    onMount(async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        user = sessionData?.session?.user;
        console.log("User session detected:", user);
    });

    async function handleAuth() {
        authError = '';
        console.log("Attempting authentication...");
        
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
        console.log("Claiming spot for league:", leagueId);
        
        const { error } = await supabase.from('user_leagues').upsert({
            user_id: user.id,
            league_id: leagueId,
            is_commissioner: false
        });
        
        if (!error) {
            console.log("Spot claimed successfully!");
            await loadLeagueContext(user.id, leagueId);
            window.location.href = '/'; 
        } else {
            console.error("Claim error:", error);
            authError = "Failed to claim spot. " + error.message;
            claiming = false;
        }
    }
</script>

<style>
    .invite-wrapper {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #050505;
        padding: 20px;
    }
    .glass-card {
        background: rgba(11, 14, 20, 0.9);
        border: 1px solid rgba(238, 191, 28, 0.3);
        border-radius: 16px;
        padding: 40px;
        max-width: 450px;
        width: 100%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .logo-img {
        width: 100px; height: 100px;
        border-radius: 50%;
        border: 3px solid var(--accent-secondary, #eebf1c);
        object-fit: cover;
        margin: 0 auto 20px;
    }
    h1 { color: #f8fafc; font-weight: 800; text-transform: uppercase; margin: 0 0 5px; }
    .subhead { color: var(--accent-secondary, #eebf1c); font-weight: 600; margin-bottom: 30px; }
    p { color: #94a3b8; margin-bottom: 30px; }
    .input-box {
        width: 100%; padding: 14px 15px; margin-bottom: 15px;
        background: #000; border: 1px solid #333; border-radius: 8px; color: #fff;
    }
    .error { color: #ff2a6d; margin-bottom: 15px; font-weight: 500; }
    .toggle { margin-top: 20px; color: #94a3b8; cursor: pointer; }
    .toggle span { color: var(--accent-secondary, #eebf1c); }
</style>

<div class="invite-wrapper">
    <div class="glass-card">
        {#if !leagueDetails}
            <h1 style="color: white;">League not found.</h1>
        {:else}
            {#if leagueDetails.logo_url}
                <img src={leagueDetails.logo_url} alt="League Logo" class="logo-img"/>
            {/if}
            <h1>Joining {leagueDetails.league_name}</h1>
            <div class="subhead">League Hub</div>

            {#if !user}
                <p>Sign up or log in to securely claim your roster spot.</p>
                <input type="email" class="input-box" placeholder="Email" bind:value={email} />
                <input type="password" class="input-box" placeholder="Password" bind:value={password} />
                {#if authError} <div class="error">{authError}</div> {/if}
                <Button variant="raised" style="width: 100%; background: #eebf1c; color: #000; font-weight: 800;" onclick={handleAuth}>
                    <Label>{isLogin ? 'Log In' : 'Sign Up'}</Label>
                </Button>
                <div class="toggle" onclick={() => isLogin = !isLogin}>
                    {isLogin ? "New user?" : "Existing account?"} <span>{isLogin ? 'Sign Up' : 'Log In'}</span>
                </div>
            {:else}
                <p>Welcome, <strong>{user.email}</strong>! Click below to claim your spot.</p>
                {#if authError} <div class="error">{authError}</div> {/if}
                <Button variant="raised" style="width: 100%; background: #eebf1c; color: #000; font-weight: 800;" onclick={claimSpot} disabled={claiming}>
                    <Label>{claiming ? 'Securing Spot...' : 'Claim Roster'}</Label>
                </Button>
            {/if}
        {/if}
    </div>
</div>