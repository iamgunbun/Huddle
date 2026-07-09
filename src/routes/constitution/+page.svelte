<script>
    import { activeLeague } from '$lib/stores/leagueContext.js';
</script>

<style>
    .constitution-container {
        max-width: 1000px;
        margin: 40px auto;
        padding: 40px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--accent-secondary, #eebf1c);
        border-radius: 16px;
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        color: var(--text-main);
    }
    h1 {
        color: var(--accent-secondary);
        text-transform: uppercase;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 15px;
        margin-top: 0;
        text-align: center;
        letter-spacing: 2px;
    }
    .content {
        line-height: 1.8;
        font-size: 1.1em;
        white-space: pre-wrap;
        margin-top: 30px;
        color: #e2e8f0;
    }
</style>

<div class="constitution-container">
    <h1>League Constitution</h1>
    <div class="content">
        {$activeLeague?.constitution_text || 'The commissioner has not published a league constitution yet.'}
    </div>
</div>