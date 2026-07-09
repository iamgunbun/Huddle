<script>
    import { round } from '$lib/utils/helper';
    export let playerA, playerB, players, playerAProj, playerBProj, playerAScore, playerBScore;

    const getPlayerObj = (id) => {
        if (!id || id === "0") return { fn: 'Empty', ln: 'Slot', pos: 'BN', t: '' };
        return players[id] || { fn: 'Unknown', ln: 'Player', pos: 'BN', t: '' };
    };
    
    $: pA = getPlayerObj(playerA);
    $: pB = getPlayerObj(playerB);

    const getAvatar = (pos, id) => {
        if (!id || id === "0") return ``;
        if (pos === 'DEF') return `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${id.toLowerCase()}.png)`;
        return `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${id}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
    }
</script>

<style>
    .player-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .player-row:last-child {
        border-bottom: none;
    }
    
    .player-side {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        overflow: hidden;
    }
    .player-side.right {
        flex-direction: row-reverse;
        text-align: right;
    }
    
    .pos {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 35px;
        height: 24px;
        border-radius: 6px;
        font-weight: 800;
        font-size: 0.75em;
        color: #111;
    }

    /* Position Colors perfectly matched to your Rosters tab */
    .QB { background-color: var(--QB, #ff2a6d); }
    .RB { background-color: var(--RB, #00ceb8); }
    .WR { background-color: var(--WR, #58a7ff); }
    .TE { background-color: var(--TE, #ffae58); }
    .K { background-color: var(--K, #bd66ff); }
    .DEF { background-color: var(--DEF, #eee45e); }
    .DL { background-color: var(--DL, #ff795a); }
    .LB { background-color: var(--LB, #6d7df5); }
    .DB { background-color: var(--DB, #ff7cb6); }
    .BN { background-color: var(--BN, #b6d0eb); }

    .avatar {
        width: 38px; 
        height: 38px;
        border-radius: 50%;
        background-color: #111;
        background-size: cover;
        background-position: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    }
    
    .info { 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        min-width: 0;
    }
    .name { 
        color: #f8fafc; 
        font-size: 0.85em; 
        font-weight: 600; 
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis; 
    }
    .meta { 
        color: #94a3b8; 
        font-size: 0.7em; 
        text-transform: uppercase;
        margin-top: 2px;
    }

    .score-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 90px;
        padding: 0 10px;
    }
    .actual { 
        font-weight: 800; 
        color: #f8fafc; 
        font-size: 1.05em; 
        display: flex; 
        gap: 12px; 
    }
    .proj { 
        font-size: 0.75em; 
        color: #94a3b8; 
        display: flex; 
        gap: 18px; 
        margin-top: 4px;
    }

    @media (max-width: 600px) {
        .avatar { display: none; }
        .name { font-size: 0.75em; }
        .pos { min-width: 28px; font-size: 0.65em; padding: 0 4px; }
        .actual { font-size: 0.9em; gap: 8px; }
        .proj { font-size: 0.65em; gap: 12px; }
        .player-side { gap: 6px; }
    }
</style>

<div class="player-row">
    <!-- Player A (Left Side) -->
    <div class="player-side">
        <span class="pos {pA.pos}">{pA.pos}</span>
        <div class="avatar" style="{getAvatar(pA.pos, playerA)}"></div>
        <div class="info">
            <span class="name">{pA.fn} {pA.ln}</span>
            <span class="meta">{pA.t || 'FA'}</span>
        </div>
    </div>

    <!-- Matchup Scores -->
    <div class="score-center">
        <div class="actual">
            <span style="color: {playerAScore > playerBScore ? '#eebf1c' : '#f8fafc'}">{round(playerAScore)}</span>
            <span style="color: rgba(255,255,255,0.2); font-size: 0.8em;">-</span>
            <span style="color: {playerBScore > playerAScore ? '#eebf1c' : '#f8fafc'}">{round(playerBScore)}</span>
        </div>
        <div class="proj">
            <span>{round(playerAProj)}</span>
            <span>{round(playerBProj)}</span>
        </div>
    </div>

    <!-- Player B (Right Side) -->
    <div class="player-side right">
        <span class="pos {pB.pos}">{pB.pos}</span>
        <div class="avatar" style="{getAvatar(pB.pos, playerB)}"></div>
        <div class="info">
            <span class="name">{pB.fn} {pB.ln}</span>
            <span class="meta">{pB.t || 'FA'}</span>
        </div>
    </div>
</div>