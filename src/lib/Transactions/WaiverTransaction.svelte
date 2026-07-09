<script>
    import { gotoManager } from '$lib/utils/helper';
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    export let transaction, players, leagueTeamManagers;

    const owner = transaction.rosters[0];
    const teamName = getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season)?.name || 'Unknown Team';

    const getAvatar = (pos, player) => {
        if(pos === 'DEF') {
            return `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png)`;
        }
        return `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
    }
</script>

<style>
    .waiver-card {
        position: relative;
        background: #0b0e14;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px 20px 20px 45px; /* FIXED: Increased left padding */
        margin-bottom: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        transition: transform 0.2s;
    }
    .waiver-card:hover { transform: translateY(-2px); }
    
    .waiver-card::before {
        content: '';
        position: absolute;
        left: 15px; /* FIXED: Pushed bracket off the outer edge */
        top: 25px;
        height: calc(100% - 50px);
        width: 20px;
        border-left: 2px solid #eebf1c;
        border-top: 2px solid #eebf1c;
        border-bottom: 2px solid #eebf1c;
        border-radius: 12px 0 0 12px;
    }

    .manager-header {
        display: flex;
        align-items: center;
        border-bottom: 2px solid #eebf1c;
        padding-bottom: 6px;
        margin-bottom: 16px;
        width: 250px;
        font-weight: 700;
        color: #f8fafc;
        letter-spacing: 0.5px;
        font-size: 1.05em;
    }

    .moves-container { display: flex; flex-direction: column; gap: 16px; }
    .move-row { display: flex; align-items: center; gap: 15px; }

    .avatar-container { position: relative; width: 50px; height: 50px; }
    .player-avatar {
        width: 100%; height: 100%; border-radius: 50%;
        background-position: center; background-repeat: no-repeat; background-size: cover;
        background-color: #111; border: 2px solid;
    }

    .player-avatar.drop { border-color: #ff2a6d; }
    .player-avatar.add { border-color: #00ceb8; }

    .badge {
        position: absolute; bottom: -4px; right: -4px; width: 20px; height: 20px;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        color: #fff; font-size: 16px; font-weight: 900; line-height: 1;
    }
    .badge.drop { background: #ff2a6d; }
    .badge.add { background: #00ceb8; }

    .player-info { display: flex; flex-direction: column; justify-content: center; text-align: left; }
    .player-name { color: #f8fafc; font-weight: 600; font-size: 0.95em; }
    .player-meta { color: #94a3b8; font-size: 0.75em; text-transform: uppercase; margin-top: 2px; }

    .timestamp {
        position: absolute; bottom: 15px; right: 20px;
        font-size: 0.75em; font-style: italic; font-weight: 600; color: #94a3b8;
    }

    @media (max-width: 500px) {
        .manager-header { width: 100%; }
        .waiver-card { padding: 15px 15px 40px 25px; }
        .timestamp { bottom: 10px; right: 15px; }
    }
</style>

<div class="waiver-card" onclick={() => gotoManager({year: transaction.season, leagueTeamManagers, rosterID: owner})}>
    <div class="manager-header">
        {teamName}
        {#if transaction.moves[0][0].bid}
            <span style="color: #94a3b8; font-style: italic; font-weight: 400; margin-left: 8px;"> - ${transaction.moves[0][0].bid}</span>
        {/if}
    </div>

    <div class="moves-container">
        {#each transaction.moves as move}
            {@const type = move[0].type === "Added" ? 'add' : 'drop'}
            {@const player = players[move[0].player]}
            <div class="move-row">
                <div class="avatar-container">
                    <div class="player-avatar {type}" style="{getAvatar(player.pos, move[0].player)}"></div>
                    <div class="badge {type}">{type === 'add' ? '+' : '-'}</div>
                </div>
                <div class="player-info">
                    <span class="player-name">{player.fn} {player.ln}</span>
                    <span class="player-meta">{player.pos} {#if player.t} - {player.t}{/if}</span>
                </div>
            </div>
        {/each}
    </div>

    <div class="timestamp">{transaction.date}</div>
</div>