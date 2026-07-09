<script>
    import { Drafts } from '$lib/components';

    export let data;
    const {upcomingDraftData, previousDraftsData, leagueTeamManagersData, playersData} = data;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 1600px; /* Gives it plenty of room but keeps it structured */
        margin: 0 auto; /* Centers the main block */
        padding: 0 20px;
        box-sizing: border-box;
    }

    /* Force the wrapper to allow scrolling if the board is massive */
    :global(.draft-container), :global(.draft-board-container) {
        width: 100%;
        overflow-x: auto !important; 
        padding: 20px !important;
        box-sizing: border-box;
    }

    /* Snap the actual table to the dead center */
    :global(.draft-board) {
        margin: 0 auto !important; 
        width: max-content !important; 
    }
</style>

<div id="main">
    <Drafts {upcomingDraftData} {previousDraftsData} {leagueTeamManagersData} {playersData} />
</div>