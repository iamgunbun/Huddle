<script>
    import { gotoManager } from '$lib/utils/helper';
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    export let transaction, players, leagueTeamManagers;

    const getAvatar = (pos, player) => {
        if(pos === 'DEF') {
            return `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png)`;
        }
        return `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
    }

    const getNumEnd = (num) => {
        switch (num) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }
</script>

<style>
    .trade-card {
        position: relative;
        background: #0b0e14;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px 20px 40px 45px; /* FIXED: Increased left padding */
        margin-bottom: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
    .trade-card::before {
        content: '';
        position: absolute; left: 15px; top: 25px; height: calc(100% - 50px); width: 20px; /* FIXED: Pushed bracket inward */
        border-left: 2px solid #eebf1c; border-top: 2px solid #eebf1c; border-bottom: 2px solid #eebf1c;
        border-radius: 12px 0 0 12px;
    }

    .manager-section { margin-bottom: 20px; }
    .manager-section:last-of-type { margin-bottom: 0; }

    <style>
    /* ... Keep your existing top styles ... */
    
    .manager-header {
        display: block; /* Helps with truncation */
        border-bottom: 2px solid #eebf1c;
        padding-bottom: 6px;
        margin-bottom: 12px;
        width: 100%;
        font-weight: 700;
        color: #f8fafc;
        letter-spacing: 0.5px;
        cursor: pointer;
        text-align: left;
        
        /* Truncation */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .manager-header:hover { color: #eebf1c; }

    /* ... Keep your existing middle styles ... */

    @media (max-width: 500px) {
        /* CRITICAL FIX: Left padding kept at 45px so the text clears the yellow bracket */
        .trade-card { padding: 15px 15px 35px 45px; } 
        .timestamp { bottom: 10px; right: 15px; }
    }
</style>

<!-- No HTML changes needed for TradeTransaction, just the CSS above will lock the layout in! -->
    .manager-header:hover { color: #eebf1c; }

    .moves-container { display: flex; flex-direction: column; gap: 12px; }
    .move-row { display: flex; align-items: center; gap: 15px; }

    .avatar-container { position: relative; width: 44px; height: 44px; }
    .player-avatar {
        width: 100%; height: 100%; border-radius: 50%; background-position: center;
        background-repeat: no-repeat; background-size: cover; background-color: #111; border: 2px solid #00ceb8;
    }
    .pick-avatar {
        width: 100%; height: 100%; border-radius: 50%; background-color: #161c26; border: 2px solid #73b647;
        display: flex; flex-direction: column; align-items: center; justify-content: center; color: #f8fafc; line-height: 1;
    }
    .faab-avatar {
        width: 100%; height: 100%; border-radius: 50%; background-color: #161c26; border: 2px solid #7947d4;
        display: flex; align-items: center; justify-content: center; color: #f8fafc; font-weight: bold;
    }

    .badge {
        position: absolute; bottom: -4px; right: -4px; width: 18px; height: 18px;
        border-radius: 50%; background: #00ceb8; display: flex; align-items: center;
        justify-content: center; color: #fff; font-size: 14px; font-weight: 900; line-height: 1;
    }

    .player-info { display: flex; flex-direction: column; justify-content: center; text-align: left; }
    .player-name { color: #f8fafc; font-weight: 600; font-size: 0.9em; }
    .player-meta { color: #94a3b8; font-size: 0.75em; text-transform: uppercase; margin-top: 2px; }

    .timestamp {
        position: absolute; bottom: 15px; right: 20px;
        font-size: 0.75em; font-style: italic; font-weight: 600; color: #94a3b8;
    }
</style>

<div class="trade-card">
    {#each transaction.rosters as owner, index}
        <div class="manager-section">
            <div class="manager-header" onclick={() => gotoManager({year: transaction.season, leagueTeamManagers, rosterID: owner})}>
                {getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name} Received:
            </div>
            <div class="moves-container">
                {#each transaction.moves as move}
                    {@const cell = move[index]}
                    {#if cell && typeof cell !== 'string'}
                        <div class="move-row">
                            {#if cell.player}
                                {@const p = players[cell.player]}
                                <div class="avatar-container">
                                    <div class="player-avatar" style="{getAvatar(p.pos, cell.player)}"></div>
                                    <div class="badge">+</div>
                                </div>
                                <div class="player-info">
                                    <span class="player-name">{p.fn} {p.ln}</span>
                                    <span class="player-meta">{p.pos} {#if p.t} - {p.t}{/if}</span>
                                </div>
                            {:else if cell.pick}
                                <div class="avatar-container">
                                    <div class="pick-avatar">
                                        <span style="font-size: 0.6em; color: #94a3b8;">Round</span>
                                        <span style="font-size: 1.1em; font-weight: bold;">{cell.pick.round}<span style="font-size: 0.6em;">{getNumEnd(cell.pick.round)}</span></span>
                                    </div>
                                    <div class="badge">+</div>
                                </div>
                                <div class="player-info">
                                    <span class="player-name">{cell.pick.season} Draft Pick</span>
                                    {#if cell.pick.original_owner && cell.pick.original_owner !== owner}
                                        <span class="player-meta">Via {getTeamFromTeamManagers(leagueTeamManagers, cell.pick.original_owner, transaction.season).name}</span>
                                    {/if}
                                </div>
                            {:else if cell.budget}
                                <div class="avatar-container">
                                    <div class="faab-avatar">${cell.budget.amount}</div>
                                    <div class="badge">+</div>
                                </div>
                                <div class="player-info">
                                    <span class="player-name">FAAB Budget</span>
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    {/each}
    <div class="timestamp">{transaction.date}</div>
</div>