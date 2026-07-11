<script>
    import LinearProgress from '@smui/linear-progress';
    import { AllManagers } from '$lib/components';

    export let data;
    const { leagueTeamManagersData } = data;
    
    let dynamicManagers = [];
    let loading = true;

    $: if (leagueTeamManagersData) {
        leagueTeamManagersData.then(managersObj => {
            const users = managersObj.users;
            
            // Transform Sleeper users into the format the AllManagers component expects
            dynamicManagers = Object.keys(users).map(userId => {
                const user = users[userId];
                return {
                    managerID: userId,
                    name: user.metadata?.team_name || user.display_name,
                    photo: user.metadata?.avatar || `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
                    mode: 'Dynasty' // Default badge
                };
            });
            loading = false;
        });
    }
</script>

<style>
    .main { 
        position: relative; 
        z-index: 1; 
    }
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
        text-align: center;
        color: #eebf1c;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
</style>

<div class="main">
    {#if loading}
        <div class="loading">
            <p>Gathering Manager Data...</p>
            <LinearProgress indeterminate />
        </div>
    {:else}
        {#await leagueTeamManagersData then leagueTeamManagers}
            <AllManagers managers={dynamicManagers} {leagueTeamManagers}/>
        {/await}
    {/if}
</div>