<script>
    import { tabs } from '$lib/utils/tabs';
    import Tab, { Icon, Label } from '@smui/tab';
    import List, { Item, Graphic, Text, Separator } from '@smui/list';
    import TabBar from '@smui/tab-bar';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto, preloadData } from '$app/navigation';
    import { enableBlog, managers } from '$lib/utils/leagueInfo';

    let active = $state(tabs.find(tab => tab.dest == page.url.pathname || (tab.nest && tab.children.find(subTab => subTab.dest == page.url.pathname))));
    let session = $state(null);
    let display = $state(false);

    let el = $state();
    let width = $state();
    let height= $state();
    let left = $state();
    let top = $state();

    onMount(async () => {
        const { data } = await supabase.auth.getSession();
        session = data.session;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
            session = _session;
        });

        return () => subscription.unsubscribe();
    });

    $effect(() => {
        top = el?.getBoundingClientRect() ? el?.getBoundingClientRect().top  : 0;
        const bottom = el?.getBoundingClientRect() ? el?.getBoundingClientRect().bottom  : 0;
        height = bottom - top + 1;
        left = el?.getBoundingClientRect() ? el?.getBoundingClientRect().left  : 0;
        const right = el?.getBoundingClientRect() ? el?.getBoundingClientRect().right  : 0;
        width = right - left;
    });

    let innerWidth = $state();

    const open = () => {
        display = !display;
    }

    const subGoto = (dest) => {
        display = false;
        goto(dest);
    }

    let tabChildren = $state([]);
    for(const tab of tabs) {
        if(tab.nest) {
            tabChildren = tab.children;
        }
    }
</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    :global(.navBar) {
        display: inline-flex;
        position: relative;
        justify-content: center;
        background-color: transparent !important;
    }

    /* FORCE WHITE FONT IN NAV */
    :global(.navBar .mdc-tab__text-label),
    :global(.navBar .material-icons),
    :global(.navBar .mdc-tab__icon) {
        color: var(--text-main, white) !important;
        opacity: 1 !important;
    }

    .parent {
        position: relative;
        display: flex;
        justify-content: center;
        background-color: transparent;
    }

    .subMenu {
        overflow-y: hidden;
        display: block;
        position: absolute;
        z-index: 5;
        background-color: var(--bg-main, #0b0e14);
        transition: all 0.4s;
    }

    /* FORCE DROPDOWN TEXT COLORS */
    :global(.subMenu .mdc-deprecated-list-item__text) {
        color: var(--text-main, #f8fafc) !important;
    }

    .overlay {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 4;
    }

    :global(.dontDisplay) {
        display: none;
    }
</style>

<div tabindex="0" role="button" class="overlay" style="display: {display ? "block" : "none"};" onclick={() => display = false}></div>

<div class="parent">
    <TabBar class="navBar" {tabs} key={(tab) => tab.key} bind:active>
        {#snippet tab(tab)}
            {#if tab.nest}
                <div bind:this={el}>
                    <Tab {tab} minWidth onclick={() => open()}>
                        <Icon class="material-icons">{tab.icon}</Icon>
                        <Label>{tab.label}</Label>
                    </Tab>
                </div>
            {:else}
                <Tab class="{tab.label == 'League Chat' && !enableBlog ? 'dontDisplay' : ''}" {tab} onTouchstart={() => preloadData(tab.dest)} onMouseover={() => preloadData(tab.dest)} href={tab.dest} minWidth>
                    <Icon class="material-icons">{tab.icon}</Icon>
                    <Label>{(tab.key === 'portal' && session) ? 'Manager Portal' : tab.label}</Label>
                </Tab>
            {/if}
        {/snippet}
    </TabBar>

    <div class="subMenu" style="max-height: {display ? 49 * tabChildren.length - 1 - (managers.length ? 0 : 48) : 0}px; width: {width}px; top: {height}px; left: {left}px; box-shadow: 0 0 {display ? "3px" : "0"} 0 var(--accent-secondary); border: {display ? "1px" : "0"} solid var(--accent-secondary); border-top: none;">
        <List>
            {#each tabChildren as subTab, ix}
                <Item onSMUIAction={() => subGoto(subTab.dest)}>
                    <Graphic class="material-icons">{subTab.icon}</Graphic>
                    <Text class="subText">{subTab.label}</Text>
                </Item>
                {#if ix != tabChildren.length - 1}
                    <Separator />
                {/if}
            {/each}
        </List>
    </div>
</div>