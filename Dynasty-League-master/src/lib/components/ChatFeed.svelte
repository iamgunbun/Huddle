<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { activeLeague } from '$lib/stores/leagueContext.js';
    import Button, { Label } from '@smui/button';
    import IconButton from '@smui/icon-button';
    import { Icon } from '@smui/common';

    let currentUser = $state(null); 
    let messages = $state([]);
    let teamMap = $state({}); 
    let loading = $state(true);
    
    let newMessage = $state('');
    let selectedFile = $state(null);
    let isUploading = $state(false);
    
    let chatContainer;
    let realtimeSubscription;

    onMount(async () => {
        const { data } = await supabase.auth.getSession();
        currentUser = data.session?.user;
    });

    $effect(() => {
        if ($activeLeague?.id && currentUser) {
            loading = true;
            loadTeamNames().then(() => {
                loadMessages().then(() => {
                    setupRealtime();
                    loading = false;
                });
            });
        }
    });

    onDestroy(() => {
        if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);
    });

    async function loadTeamNames() {
        const { data } = await supabase.from('user_leagues').select('user_id, team_name').eq('league_id', $activeLeague.id);
        if (data) {
            const map = {};
            data.forEach(user => map[user.user_id] = user.team_name);
            teamMap = map;
        }
    }

    async function loadMessages() {
        const { data, error } = await supabase.from('chat_messages').select('*').eq('league_id', $activeLeague.id).order('created_at', { ascending: true });
        if (!error && data) {
            messages = data;
            scrollToBottom();
        }
    }

    function setupRealtime() {
        if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);
        
        realtimeSubscription = supabase.channel(`public:chat_messages`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages'
            }, (payload) => {
                // Client-side filter prevents UUID/String database mismatch errors
                if (payload.new.league_id === $activeLeague.id) {
                    // Prevent duplicates if sender already forced a local refresh
                    const alreadyExists = messages.some(m => m.id === payload.new.id);
                    if (!alreadyExists) {
                        messages = [...messages, payload.new];
                        scrollToBottom();
                    }
                }
            }).subscribe();
    }

    function scrollToBottom() {
        setTimeout(() => { if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight; }, 100);
    }

    function triggerFileInput() { document.getElementById('media-upload').click(); }

    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) selectedFile = file;
    }

    async function sendMessage() {
        if ((!newMessage.trim() && !selectedFile) || !currentUser) return;
        isUploading = true;
        let mediaUrl = null;

        if (selectedFile) {
            const fileExt = selectedFile.name.split('.').pop();
            const filePath = `${$activeLeague.id}/${Math.random()}.${fileExt}`; 
            const { error: uploadError } = await supabase.storage.from('chat-media').upload(filePath, selectedFile);
            if (!uploadError) {
                const { data } = supabase.storage.from('chat-media').getPublicUrl(filePath);
                mediaUrl = data.publicUrl;
            }
        }

        const payload = { league_id: $activeLeague.id, user_id: currentUser.id, text_content: newMessage.trim() || null, media_url: mediaUrl };
        const { error } = await supabase.from('chat_messages').insert(payload);
        
        if (!error) { 
            newMessage = ''; 
            selectedFile = null; 
            await loadMessages(); // INSTANT UI REFRESH FOR THE SENDER
        }
        isUploading = false;
    }

    function handleKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
</script>

<style>
    /* ... (Keep your exact same CSS from my previous message for this file) ... */
    .chat-wrapper { display: flex; flex-direction: column; height: 100%; width: 100%; background: transparent; overflow: hidden; }
    .chat-header { flex: 0 0 auto; padding: 15px; background: rgba(0, 0, 0, 0.4); border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold; text-align: center; color: var(--text-main); }
    .chat-messages { flex: 1 1 auto; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
    .message-row { display: flex; flex-direction: column; max-width: 85%; }
    .message-row.mine { align-self: flex-end; align-items: flex-end; }
    .team-label { font-size: 0.7em; color: var(--text-muted); margin-bottom: 4px; padding: 0 4px; }
    .bubble { padding: 10px 14px; border-radius: 12px; color: #fff; font-size: 0.9em; word-wrap: break-word; }
    .mine .bubble { background: var(--accent-primary, #0b0e14); border-bottom-right-radius: 2px; }
    .theirs .bubble { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); border-bottom-left-radius: 2px; }
    .media-attachment { max-width: 100%; border-radius: 8px; margin-top: 5px; }
    .chat-input-area { flex: 0 0 auto; padding: 10px; background: rgba(0,0,0,0.6); display: flex; gap: 8px; align-items: flex-end; border-top: 1px solid var(--glass-border); }
    textarea { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; padding: 10px; border-radius: 8px; resize: none; outline: none; font-family: inherit; max-height: 80px; }
    textarea:focus { border-color: var(--accent-secondary); }
    input[type="file"] { display: none; }
    .file-preview { font-size: 0.75em; color: var(--accent-secondary); padding: 4px 10px; background: rgba(0,0,0,0.5); }
</style>

<div class="chat-wrapper">
    <div class="chat-header">League Huddle</div>
    
    <div class="chat-messages" bind:this={chatContainer}>
        {#if loading}
            <div style="text-align:center; color:var(--text-muted); font-size:0.9em; margin-top:20px;">Loading chat...</div>
        {:else}
            {#each messages as msg}
                {@const isMine = msg.user_id === currentUser?.id}
                <div class="message-row {isMine ? 'mine' : 'theirs'}">
                    {#if !isMine}<div class="team-label">{teamMap[msg.user_id] || 'Manager'}</div>{/if}
                    <div class="bubble">
                        {#if msg.text_content}<span>{msg.text_content}</span>{/if}
                        {#if msg.media_url}
                            {#if msg.media_url.match(/\.(mp4|webm|mov)$/i)}
                                <video class="media-attachment" controls><source src={msg.media_url} /></video>
                            {:else}
                                <img class="media-attachment" src={msg.media_url} alt="media" />
                            {/if}
                        {/if}
                    </div>
                </div>
            {/each}
        {/if}
    </div>

    {#if selectedFile}<div class="file-preview">📎 {selectedFile.name} ready to send</div>{/if}

    <div class="chat-input-area">
        <input type="file" id="media-upload" accept="image/*,video/*" onchange={handleFileChange} />
        
        <IconButton class="material-icons" onclick={triggerFileInput} style="color: var(--text-muted); padding: 8px;" title="Attach Media">
            attach_file
        </IconButton>
        
        <textarea bind:value={newMessage} onkeydown={handleKeydown} placeholder="Type a message..." rows="1"></textarea>
        
        <Button variant="raised" class="btn-primary" onclick={sendMessage} disabled={isUploading || (!newMessage.trim() && !selectedFile)} style="padding: 0 10px; min-width: 50px;">
            <Icon class="material-icons" style="margin: 0;">send</Icon>
        </Button>
    </div>
</div>