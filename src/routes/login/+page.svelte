<script>
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    let email = $state('');
    let password = $state('');
    let isLogin = $state(true);
    let authError = $state('');
    let loading = $state(false);

    async function handleAuth() {
        if (!email || !password) return;
        
        loading = true;
        authError = '';
        
        if (isLogin) {
            // Existing users go straight to the dashboard
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) authError = error.message;
            else goto('/');
        } else {
            // CRITICAL FIX: Brand new users are forced to the setup page to connect a platform
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) authError = error.message;
            else goto('/add-league'); 
        }
        loading = false;
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAuth();
        }
    }
</script>

<style>
    /* Deep Black & Shining Gold Base */
    :global(body) { margin: 0; background-color: #050505; }
    
    .login-layout {
        display: flex;
        min-height: 100vh;
        background-color: #050505;
        font-family: 'Montserrat', sans-serif;
    }

    /* Left Side: Glowing Brand Logo & Summary */
    .brand-side {
        flex: 1.2;
        display: flex;
        justify-content: center;
        align-items: center;
        background: radial-gradient(circle at center, rgba(238, 191, 28, 0.15) 0%, #050505 60%);
        border-right: 1px solid rgba(238, 191, 28, 0.2);
    }
    .brand-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 0 40px;
    }
    .brand-logo {
        max-width: 60%;
        filter: drop-shadow(0 0 25px rgba(238, 191, 28, 0.5));
        transition: filter 0.3s ease-in-out;
        margin-bottom: 25px;
    }
    .brand-logo:hover {
        filter: drop-shadow(0 0 40px rgba(238, 191, 28, 0.8));
    }
    .brand-summary {
        color: #94a3b8;
        font-size: 1.1em;
        line-height: 1.6;
        max-width: 450px;
        font-weight: 500;
        text-shadow: 0 4px 10px rgba(0,0,0,0.8);
    }
    .brand-summary strong {
        color: #eebf1c;
    }
    .future-platforms {
        margin-top: 15px;
        font-size: 0.85em;
        color: #64748b;
        font-style: italic;
    }

    /* Right Side: Textless Form */
    .form-side {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
    }
    .glass-box {
        width: 100%;
        max-width: 400px;
        background: rgba(11, 14, 20, 0.6);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(238, 191, 28, 0.4);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 50px rgba(238, 191, 28, 0.1);
    }

    .input-field {
        width: 100%;
        padding: 16px;
        margin-bottom: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(238, 191, 28, 0.3);
        border-radius: 8px;
        color: #f8fafc;
        font-family: inherit;
        font-weight: 500;
        outline: none;
        box-sizing: border-box;
        transition: all 0.3s;
    }
    .input-field:focus {
        border-color: #eebf1c;
        box-shadow: 0 0 15px rgba(238, 191, 28, 0.3);
    }

    /* Shining Gold Button */
    .gold-btn {
        width: 100%;
        padding: 16px;
        background: linear-gradient(90deg, #b8860b, #ffd700, #b8860b);
        background-size: 200% auto;
        color: #000;
        border: none;
        border-radius: 8px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 2px;
        cursor: pointer;
        transition: 0.5s;
        margin-bottom: 20px;
    }
    .gold-btn:hover {
        background-position: right center;
        box-shadow: 0 0 20px rgba(238, 191, 28, 0.6);
    }

    .toggle-link {
        text-align: center;
        color: #94a3b8;
        font-size: 0.85em;
        cursor: pointer;
        margin-top: 15px;
        font-weight: 600;
    }
    .toggle-link span { color: #eebf1c; }
    
    .error { color: #ef4444; font-size: 0.85em; margin-bottom: 15px; text-align: center; font-weight: bold; }

    @media (max-width: 768px) {
        .login-layout { flex-direction: column; }
        .brand-side { border-right: none; border-bottom: 1px solid rgba(238, 191, 28, 0.2); padding: 50px 0; flex: none; }
        .brand-logo { max-width: 50%; }
        .glass-box { padding: 30px; background: transparent; border: none; box-shadow: none; }
    }
</style>

<div class="login-layout">
    <div class="brand-side">
        <div class="brand-content">
            <img src="/brand.png" alt="League Brand" class="brand-logo" />
            <div class="brand-summary">
                The ultimate custom platform for your fantasy football league. Sync your <strong>Sleeper</strong> leagues, track historical records, and manage your empire all in one place.
                <div class="future-platforms">* Integrations for Yahoo, ESPN, and other platforms are currently in the works.</div>
            </div>
        </div>
    </div>

    <div class="form-side">
        <div class="glass-box">
            
            {#if authError} <div class="error">{authError}</div> {/if}

            <input 
                type="email" 
                class="input-field" 
                placeholder="Email" 
                bind:value={email} 
                onkeydown={handleKeydown} 
            />
            
            <input 
                type="password" 
                class="input-field" 
                placeholder="Password" 
                bind:value={password} 
                onkeydown={handleKeydown} 
            />

            <button class="gold-btn" onclick={handleAuth} disabled={loading}>
                {loading ? '...' : (isLogin ? 'ENTER' : 'JOIN')}
            </button>

            <div class="toggle-link" onclick={() => { isLogin = !isLogin; authError = ''; }}>
                {isLogin ? "NEW?" : "RETURNING?"} <span>{isLogin ? 'CREATE ACCOUNT' : 'LOGIN'}</span>
            </div>
        </div>
    </div>
</div>