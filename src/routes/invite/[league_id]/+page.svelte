<script>
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { loadLeagueContext } from '$lib/stores/leagueContext';
    import Button, { Label } from '@smui/button';

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

<style>
    .invite-wrapper {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: radial-gradient(circle at center, rgba(238, 191, 28, 0.1) 0%, #050505 80%);
        padding: 20px;
    }
    .glass-card {
        background: rgba(11, 14, 20, 0.8);
        backdrop-filter: blur(15px);
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
    h1 {
        font-weight: 800;
        font-size: 1.6em;
        margin: 0 0 5px;
        color: #f8fafc;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .subhead { color: var(--accent-secondary, #eebf1c); font-weight: 600; margin-bottom: 30px; }
    p { color: #94a3b8; font-size: 0.95em; line-height: 1.6; margin-bottom: 30px; }
    .input-box {
        width: 100%;
        padding: 14px 15px;
        margin-bottom: 15px;
        background: rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: #fff;
        font-family: inherit;
        outline: none;
        box-sizing: border-box;
    }
    .input-box:focus { border-color: var(--accent-secondary, #eebf1c); }
    .error { color: #ff2a6d; font-size: 0.85em; margin-bottom: 15px; font-weight: 500; }
    .toggle { margin-top: 20px; font-size: 0.85em; color: #94a3b8; cursor: pointer; }
    .toggle span { color: var(--accent-secondary, #eebf1c); font-weight: 600; }
</style>

<div class="invite-wrapper">
    <div class="glass-card">
        {#if leagueDetails?.logo_url}
            <img src={leagueDetails.logo_url} alt="League Logo" class="logo-img"/>
        {/if}
        
        <h1>Joining {leagueDetails?.league_name}</h1>
        <div class="subhead">League Hub</div>

        {#if !user}
            <p>Sign up or log in to securely claim your roster spot and join the league chat.</p>

            <input type="email" class="input-box" placeholder="Email Address" bind:value={email} />
            <input type="password" class="input-box" placeholder="Password" bind:value={password} />

            {#if authError} <div class="error">{authError}</div> {/if}
            
            <Button variant="raised" style="width: 100%; background: var(--accent-secondary, #eebf1c); color: #000; font-weight: 800; padding: 20px 0;" onclick={handleAuth}>
                <Label>{isLogin ? 'Log In to Continue' : 'Create Account to Join'}</Label>
            </Button>
            
            <div class="toggle" onclick={() => { isLogin = !isLogin; authError = ''; }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"} 
                <span>{isLogin ? 'Sign Up' : 'Log In'}</span>
            </div>
        {:else}
            <p>Welcome back, <strong>{user.email}</strong>! Click below to officially lock in your spot and enter the league hub.</p>

            {#if authError} <div class="error">{authError}</div> {/if}
            
            <Button variant="raised" style="width: 100%; background: var(--accent-secondary, #eebf1c); color: #000; font-weight: 800; padding: 20px 0;" onclick={claimSpot} disabled={claiming}>
                <Label>{claiming ? 'Securing Spot...' : 'Claim Roster & Enter Hub'}</Label>
            </Button>
        {/if}
    </div>
</div>