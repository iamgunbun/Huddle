<script>
    import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers, gotoManager, round } from "./utils/helperFunctions/universalFunctions";
    export let leagueTeamManagers, stat, label, xMin, xMax, secondStat, managerID, rosterID, color, year;
    $: user = managerID ? leagueTeamManagers.users[managerID] : null;
</script>

<style>
    :global(.opacity) { opacity: 0.4; }
    .barParent { position: relative; margin-bottom: -10px; height: 76px; }
    
    .managerName {
        position: absolute; top: 0; left: 80px; color: #f8fafc; font-weight: 600;
    }
    .teamAvatar {
        position: absolute; left: 20px; top: 0; bottom: 0; height: 40px;
        margin: auto; border-radius: 50%; border: 2px solid; z-index: 14; background-color: #111;
    }
    
    .statBars { display: flex; margin: 0 auto; }
    .leftSpacer { width: 40px; height: 1px; display: inline-block; }
    .rightSpacer { width: 20px; height: 1px; display: inline-block; }
    
    .bars { flex-grow: 2; position: relative; }
    .bar {
        height: 24px;
        border-radius: 0 12px 12px 0;
        z-index: 10;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-left: none;
        backdrop-filter: blur(4px);
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
    }
    
    .secondBar { position: absolute; top: 0; z-index: 11; left: 0; }
    
    .barLabel {
        z-index: 12; margin-left: 45px; font-weight: bold;
        color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    }
    
    .vCenter { display: block; height: 24px; position: absolute; width: 100%; top: 0; bottom: 0; margin: auto 0; }
    .clickable { cursor: pointer; }

    @media (max-width: 600px) {
        .barParent { height: 57px; }
        .managerName { left: 60px; font-size: 0.8em; }
        .teamAvatar { left: 10px; height: 30px; }
        .barLabel { margin-left: 30px; font-size: 0.8em; }
        .leftSpacer { width: 30px; }
        .rightSpacer { width: 10px; }
        .bar { height: 20px; border-radius: 0 10px 10px 0; }
        .vCenter { height: 20px; }
    }
</style>

<div class="barParent">
    <img alt="team avatar" onclick={() => gotoManager({year, leagueTeamManagers, managerID, rosterID})} style="border-color: var({color});" class="teamAvatar clickable" src="{user ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : getAvatarFromTeamManagers(leagueTeamManagers, rosterID, year)}" />
    <span class="managerName clickable" onclick={() => gotoManager({year, leagueTeamManagers, managerID, rosterID})}>
        {#if user}
            {user.display_name}
        {:else if rosterID}
            {getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, year)}
        {/if}
    </span>
    <div class="vCenter">
        <div class="statBars">
            <div class="leftSpacer" />
            <div class="bars">
                <div class="bar{!secondStat  ? '' : ' opacity'}" style="background-color: var({color}); width: {(stat - xMin) / (xMax - xMin == 0 ? 1 : (xMax - xMin)) * 100}%;">
                    {#if !secondStat}
                        <span class="barLabel">{stat}{label}</span>
                    {/if}
                </div>
                {#if secondStat}
                    <div class="bar secondBar" style="background-color: var({color}); width: {(secondStat - xMin) / (xMax - xMin == 0 ? 1 : (xMax - xMin)) * 100}%;">
                        <span class="barLabel">{secondStat}&nbsp;&nbsp;of&nbsp;&nbsp;{stat}&nbsp;&nbsp;({round(secondStat/stat*100)}%)</span>
                    </div>
                {/if}
            </div>
            <div class="rightSpacer" />
        </div>
    </div>
</div>