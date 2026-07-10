<script>
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { loadLeagueContext } from '$lib/stores/leagueContext';
    import Button, { Label } from '@smui/button';

    export let data; 
    
    $: leagueDetails = data?.leagueDetails || null;
    $: leagueId = data?.leagueId || null;
    $: sleeperUsers = data?.sleeperUsers || [];

    let user = null;
    let claiming = false;
    let email = '';
    let password = '';
    let selectedTeam = ''; // Tracks the team they pick from the dropdown
    let isLogin = true;
    let authError = '';

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
        if (!user) return;
        
        // Ensure they actually picked a team before submitting
        if (!selectedTeam) {
            authError = "Please select your team from the dropdown.";
            return;
        }

        claiming = true;
        authError = '';

        const { error } = await supabase.from('user_leagues').upsert({
            user_id: user.id,
            league_id: leagueId,
            is_commissioner: false,
            team_name: selectedTeam // Links their Huddle account to this specific team!
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
        border: 3px solid #eebf1c;
        object-fit: cover;
        margin: 0 auto 20px;
    }
    h1 { 
        color: #f8fafc; 
        font-weight: 900; 
        text-transform: uppercase; 
        margin: 0 0 5px; 
        font-size: 1.25em; 
        line-height: 1.3;
    }
    .subhead { 
        color: #eebf1c; 
        font-weight: 700; 
        margin-bottom: 25px; 
        font-size: 0.9em;
        letter-spacing: 1px;
        text-transform: uppercase;
    }
    p { 
        color: #94a3b8; 
        margin-bottom: 25px; 
        font-size: 0.95em; 
        line-height: 1.5; 
    }
    .input-box {
        width: 100%; padding: 14px 15px; margin-bottom: 15px;
        background: #000; border: 1px solid #333; border-radius: 8px; color: #fff;
        font-family: inherit; font-size: 1em; outline: none;
    }
    select.input-box {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23EEBF1C%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
        background-repeat: no-repeat;
        background-position: right 15px top 50%;
        background-size: 12px auto;
    }
    select.input-box:focus { border-color: #eebf1c; }
    .input-label {
        display: block;
        text-align: left;
        color: #94a3b8;
        font-size: 0.8em;
        text-transform: uppercase;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
    }
    .error { color: #ff2a6d; margin-bottom: 15px; font-weight: 600; font-size: 0.9em; }
</style>

<div class="invite-wrapper">
    {#if !leagueDetails}
        <div style="color: white; font-family: sans-serif;">Loading League Hub...</div>
    {:else}
        <div class="glass-card">
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
                <div class="toggle" style="margin-top:20px; color:#94a3b8; cursor:pointer; font-size: 0.9em;" onclick={() => isLogin = !isLogin}>
                    {isLogin ? "New user?" : "Existing account?"} <span style="color:#eebf1c; font-weight: 600;">{isLogin ? 'Sign Up' : 'Log In'}</span>
                </div>
            {:else}
                <p>Welcome, <strong style="color: #f8fafc;">{user.email}</strong>! Select your team to finish joining the hub.</p>
                
                <div style="margin-bottom: 25px;">
                    <label class="input-label">Select Your Team</label>
                    {#if sleeperUsers.length > 0}
                        <select class="input-box" bind:value={selectedTeam}>
                            <option value="" disabled selected>-- Choose your Sleeper Team --</option>
                            {#each sleeperUsers as su}
                                <option value={su.display_name}>{su.display_name}</option>
                            {/each}
                        </select>
                    {:else}
                        <input type="text" class="input-box" placeholder="Enter your Team Name" bind:value={selectedTeam} />
                    {/if}
                </div>

                {#if authError} <div class="error">{authError}</div> {/if}
                <Button variant="raised" style="width: 100%; background: #eebf1c; color: #000; font-weight: 800; height: 50px;" onclick={claimSpot} disabled={claiming}>
                    <Label>{claiming ? 'Securing Spot...' : 'Claim Roster'}</Label>
                </Button>
            {/if}
        </div>
    {/if}
</div>