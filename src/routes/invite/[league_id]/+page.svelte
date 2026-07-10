<script>
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { loadLeagueContext } from '$lib/stores/leagueContext';
    import Button, { Label } from '@smui/button';

    let leagueId = $page.params.league_id;
    let loading = true;
    let user = $state(null);
    let leagueDetails = $state(null);
    let claiming = $state(false);
    
    // Auth States for new users
    let email = $state('');
    let password = $state('');
    let isLogin = $state(true);
    let authError = $state('');

    onMount(async () => {
        // Fetch League Data so the user sees what they are joining
        const { data: lData } = await supabase.from('leagues').select('*').eq('id', leagueId).single();
        leagueDetails = lData;

        // Check if user is already authenticated on this device
        const { data } = await supabase.auth.getSession();
        user = data?.session?.user;
        loading = false;
    });

    async function handleAuth() {
        authError = '';
        if (isLogin) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) authError = error.message;
            else user = data.user;
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) authError = error.message;
            else user = data.user;
        }
    }

    async function claimSpot() {
        claiming = true;
        // Securely bind the user to this league
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
        background-color: #0b0e14;
        padding: 20px;
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(238, 191, 28, 0.2);
        border-radius: 16px;
        padding: 40px;
        max-width: 450px;
        width: 100%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .logo-img {
        width: 80px; height: 80px;
        border-radius: 50%;
        border: 2px solid var(--accent-secondary);
        object-fit: cover;
        margin-bottom: 20px;
    }
    h1 {
        font-weight: 600;
        font-size: 1.4em;
        margin: 0 0 10px;
        color: #f8fafc;
        letter-spacing: 1px;
    }
    p { color: #94a3b8; font-size: 0.9em; line-height: 1.6; margin-bottom: 30px; }
    
    .input-box {
        width: 100%;
        padding: 12px 15px;
        margin-bottom: 15px;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: #fff;
        font-family: inherit;
        outline: none;
        box-sizing: border-box;
    }
    .input-box:focus { border-color: var(--accent-secondary); }
    .error { color: #ff2a6d; font-size: 0.85em; margin-bottom: 15px; font-weight: 500; }
    .toggle { margin-top: 20px; font-size: 0.85em; color: #94a3b8; cursor: pointer; }
    .toggle span { color: var(--accent-secondary); font-weight: 600; }
</style>

<div class="invite-wrapper">
    {#if loading}
        <div style="color: var(--accent-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Securing Invite Link...</div>
    {:else}
        <div class="glass-card">
            
            {#if leagueDetails?.logo_url}
                <img src={leagueDetails.logo_url} alt="League Logo" class="logo-img"/>
            {:else}
                <div class="logo-img" style="display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; background: #111;">
                    <span class="material-icons" style="color: var(--accent-secondary); font-size: 35px;">sports_football</span>
                </div>
            {/if}

            <h1>You've been invited to join<br/><span style="color: var(--accent-secondary); font-weight: 800;">{leagueDetails?.league_name || 'A Fantasy League'}</span></h1>
            
            {#if !user}
                <p>Sign up or log in to securely claim your roster spot.</p>
                
                <input type="email" class="input-box" placeholder="Email Address" bind:value={email} />
                <input type="password" class="input-box" placeholder="Password" bind:value={password} />
                
                {#if authError} <div class="error">{authError}</div> {/if}

                <Button variant="raised" style="width: 100%; background: var(--accent-secondary); color: #000; font-weight: 600;" onclick={handleAuth}>
                    <Label>{isLogin ? 'Log In to Continue' : 'Create Account to Join'}</Label>
                </Button>

                <div class="toggle" onclick={() => { isLogin = !isLogin; authError = ''; }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"} 
                    <span>{isLogin ? 'Sign Up' : 'Log In'}</span>
                </div>

            {:else}
                <p>Welcome back, <strong>{user.email}</strong>! Click below to officially lock in your spot and add this league to your Admin Dashboard.</p>
                
                {#if authError} <div class="error">{authError}</div> {/if}

                <Button variant="raised" style="width: 100%; background: var(--accent-secondary); color: #000; font-weight: 600;" onclick={claimSpot} disabled={claiming}>
                    <Label>{claiming ? 'Securing Spot...' : 'Claim Roster & Enter Hub'}</Label>
                </Button>
            {/if}

        </div>
    {/if}
</div>