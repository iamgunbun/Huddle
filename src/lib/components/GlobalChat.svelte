<script>
    import { onMount, onDestroy } from 'svelte';
    import IconButton from '@smui/icon-button';
    import { activeLeague } from '$lib/stores/leagueContext';
    import { supabase } from '$lib/supabaseClient';

    let chatOpen = $state(false);
    let messages = $state([]);
    let newMessage = $state('');
    let unreadCount = $state(0);
    
    // Media & UI States
    let isUploading = $state(false);
    let showGifTray = $state(false);
    let showEmojiTray = $state(false);
    let gifQuery = $state('');
    let gifResults = $state([]);

    const commonEmojis = ['😂', '💀', '🔥', '👀', '💯', '🏈', '🏆', '🍻', '📈', '📉', '😭', '🤝'];

    // --- REALTIME BACKEND STATE ---
    let currentUser = $state(null);
    let teamMap = $state({});
    let realtimeSubscription;
    let chatContainer;
    let activeChannelId = $state(null); 

    onMount(async () => {
        const { data } = await supabase.auth.getSession();
        currentUser = data.session?.user;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && activeChannelId) {
                loadMessages();
                setupRealtime(activeChannelId);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    });

    $effect(() => {
        const leagueId = $activeLeague?.id;
        const uid = currentUser?.id;

        if (leagueId && uid) {
            if (activeChannelId !== leagueId) {
                activeChannelId = leagueId;
                
                loadTeamNames().then(() => {
                    loadMessages().then(() => {
                        setupRealtime(leagueId);
                    });
                });
            }
        }
    });

    onDestroy(() => {
        if (realtimeSubscription) {
            supabase.removeChannel(realtimeSubscription);
        }
    });

    async function loadTeamNames() {
        const { data } = await supabase.from('user_leagues').select('user_id, team_name').eq('league_id', activeChannelId);
        if (data) {
            const map = {};
            data.forEach(user => {
                // Fetch the mapped team name, default to Unknown Team if DB column is blank
                map[user.user_id] = (user.team_name && user.team_name.trim() !== '') ? user.team_name : 'Unknown Team';
            });
            teamMap = map;
        }
    }

    async function loadMessages() {
        const { data, error } = await supabase.from('chat_messages')
            .select('*')
            .eq('league_id', activeChannelId)
            .order('created_at', { ascending: true });
        
        if (!error && data) {
            messages = data.map(msg => ({
                id: msg.id,
                user_id: msg.user_id,
                sender: msg.user_id === currentUser.id ? 'You' : (teamMap[msg.user_id] || 'Unknown Team'),
                text: msg.text_content || msg.media_url,
                type: msg.media_url ? (msg.media_url.includes('giphy') || msg.media_url.includes('tenor') ? 'gif' : 'image') : 'text'
            }));
            
            if (chatOpen) scrollToBottom();
        }
    }

    function setupRealtime(leagueId) {
        if (realtimeSubscription) {
            supabase.removeChannel(realtimeSubscription);
        }

        realtimeSubscription = supabase.channel(`public:chat_messages`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages'
            }, (payload) => {
                const msg = payload.new;
                
                if (msg.league_id !== leagueId) return;
                if (messages.some(m => m.id === msg.id)) return;

                const newMsgObj = {
                    id: msg.id,
                    user_id: msg.user_id,
                    sender: msg.user_id === currentUser?.id ? 'You' : (teamMap[msg.user_id] || 'Unknown Team'),
                    text: msg.text_content || msg.media_url,
                    type: msg.media_url ? (msg.media_url.includes('giphy') || msg.media_url.includes('tenor') ? 'gif' : 'image') : 'text'
                };

                messages = [...messages, newMsgObj];
                
                if (!chatOpen && msg.user_id !== currentUser?.id) {
                    unreadCount++;
                } else if (chatOpen) {
                    scrollToBottom();
                }
            }).subscribe((status) => {
                if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setTimeout(() => {
                        if (activeChannelId) setupRealtime(activeChannelId);
                    }, 3000);
                }
            });
    }

    function scrollToBottom() {
        setTimeout(() => { if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight; }, 100);
    }

    function toggleChat() {
        chatOpen = !chatOpen;
        if (chatOpen) {
            unreadCount = 0;
            showGifTray = false;
            showEmojiTray = false;
            scrollToBottom();
        }
    }

    async function sendMessage(content, type = 'text') {
        if ((type === 'text' && !content.trim()) || !currentUser) return;
        
        showGifTray = false;
        showEmojiTray = false;
        
        if (type === 'text') {
            newMessage = '';
        }

        const payload = {
            league_id: activeChannelId,
            user_id: currentUser.id,
            text_content: type === 'text' ? content.trim() : null,
            media_url: type !== 'text' ? content : null
        };

        const { data, error } = await supabase.from('chat_messages').insert(payload).select().single();
        
        if (error) {
            console.error("🚨 Supabase Insert Error:", error.message);
        } else {
            const confirmedMsg = {
                id: data.id,
                user_id: data.user_id,
                sender: 'You',
                text: data.text_content || data.media_url,
                type: data.media_url ? (data.media_url.includes('giphy') || data.media_url.includes('tenor') ? 'gif' : 'image') : 'text'
            };
            
            messages = [...messages, confirmedMsg];
            scrollToBottom();
        }
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        isUploading = true;
        const fileExt = file.name.split('.').pop();
        const fileName = `${activeChannelId}/${Math.random()}.${fileExt}`;

        const { error } = await supabase.storage.from('chat-media').upload(fileName, file);

        if (!error) {
            const { data } = supabase.storage.from('chat-media').getPublicUrl(fileName);
            sendMessage(data.publicUrl, 'image');
        } else {
            console.error("Upload failed:", error);
            alert("Image upload failed.");
        }
        isUploading = false;
    }

    async function searchGifs() {
        if (!gifQuery) return;
        try {
            const res = await fetch(`https://g.tenor.com/v1/search?q=${gifQuery}&key=LIVDSRZULECB&limit=12`);
            const data = await res.json();
            gifResults = data.results || [];
        } catch (err) {
            console.error("GIF Fetch Error:", err);
            gifResults = [];
        }
    }

    function addEmoji(emoji) {
        newMessage = newMessage + emoji;
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(newMessage);
        }
    }
</script>

<style>
    .chat-trigger {
        position: fixed; bottom: 25px; right: 25px;
        background: rgba(11, 14, 20, 0.8); backdrop-filter: blur(12px);
        border: 1px solid rgba(238, 191, 28, 0.4); border-radius: 12px;
        padding: 12px 20px; color: #f8fafc; font-family: 'Montserrat', sans-serif;
        font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
        display: flex; align-items: center; gap: 10px; cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 99999; transition: all 0.2s;
    }
    .chat-trigger:hover { background: rgba(11, 14, 20, 0.95); border-color: rgba(238, 191, 28, 0.8); }

    .notification-badge {
        position: absolute; top: -10px; right: -10px;
        background: #ef4444; color: white; font-weight: 800;
        font-size: 0.8em; padding: 4px 8px; border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: 2px solid #050505;
        z-index: 100000;
    }

    .chat-window {
        position: fixed; bottom: 85px; right: 25px; width: 360px; height: 550px;
        background: rgba(11, 14, 20, 0.95); backdrop-filter: blur(20px);
        border: 1px solid rgba(238, 191, 28, 0.3); border-radius: 16px;
        display: flex; flex-direction: column; z-index: 99999;
        box-shadow: 0 10px 40px rgba(0,0,0,0.7); overflow: hidden;
    }

    .messages-area { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; }
    
    .message-bubble {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        padding: 10px 14px; border-radius: 12px; font-size: 0.9em; width: max-content; max-width: 85%;
        word-wrap: break-word; white-space: pre-wrap;
    }
    .message-bubble.own {
        background: rgba(238, 191, 28, 0.1); border-color: rgba(238, 191, 28, 0.3);
        align-self: flex-end;
    }
    
    .media-img { max-width: 100%; border-radius: 8px; margin-top: 5px; }

    .input-tray { background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.1); padding: 10px; }
    
    .action-row { display: flex; gap: 5px; margin-bottom: 8px; }
    .action-btn { background: none; border: none; color: #94a3b8; cursor: pointer; transition: color 0.2s; padding: 4px; }
    .action-btn:hover { color: var(--accent-secondary); }

    .text-input-row { display: flex; gap: 10px; align-items: center; }
    .chat-input {
        flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px; padding: 10px 15px; color: #fff; font-family: inherit; outline: none;
    }
    .chat-input:focus { border-color: var(--accent-secondary); }

    .utility-tray {
        background: #161c26; border-top: 1px solid rgba(255,255,255,0.1); padding: 10px;
        max-height: 200px; overflow-y: auto;
    }
    .gif-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px; }
    .gif-grid img { width: 100%; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer; }
    .emoji-grid { display: flex; flex-wrap: wrap; gap: 8px; font-size: 1.5em; cursor: pointer; }
    
    @media (max-width: 600px) {
        .chat-trigger { bottom: 15px; right: 15px; }
        .chat-window { bottom: 75px; right: 10px; width: calc(100% - 20px); height: 450px; }
    }
</style>

<button class="chat-trigger" onclick={toggleChat}>
    {#if unreadCount > 0}
        <div class="notification-badge">{unreadCount}</div>
    {/if}
    <span class="material-icons" style="color: var(--accent-secondary);">forum</span>
    League Chat
</button>

{#if chatOpen}
    <div class="chat-window">
        <div style="padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3);">
            <span style="color: var(--accent-secondary); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                {$activeLeague?.league_name || 'Huddle Chat'}
            </span>
            <IconButton class="material-icons" onclick={() => chatOpen = false} style="color: #ef4444; margin: -10px;">close</IconButton>
        </div>

        <div class="messages-area" bind:this={chatContainer}>
            {#each messages as msg}
                <div class="message-bubble {msg.sender === 'You' ? 'own' : ''}">
                    <div style="font-size: 0.75em; color: #94a3b8; font-weight: bold; margin-bottom: 4px;">{msg.sender}</div>
                    {#if msg.type === 'image'}
                        <img src={msg.text} class="media-img" alt="Uploaded Media" />
                    {:else if msg.type === 'gif'}
                        <img src={msg.text} class="media-img" alt="GIF" />
                    {:else}
                        {msg.text}
                    {/if}
                </div>
            {/each}
        </div>

        {#if showGifTray}
            <div class="utility-tray">
                <div style="display: flex; gap: 10px;">
                    <input type="text" placeholder="Search Tenor..." bind:value={gifQuery} class="chat-input" onkeydown={(e) => e.key === 'Enter' && searchGifs()} />
                    <button onclick={searchGifs} style="background: var(--accent-secondary); color: #000; border: none; border-radius: 6px; padding: 0 15px; font-weight: bold; cursor: pointer;">GO</button>
                </div>
                <div class="gif-grid">
                    {#each gifResults as gif}
                        <img 
                            src={gif.media[0].tinygif.url} 
                            alt="gif result" 
                            onclick={() => sendMessage(gif.media[0].tinygif.url, 'gif')} 
                        />
                    {/each}
                </div>
            </div>
        {/if}
        {#if showEmojiTray}
            <div class="utility-tray">
                <div class="emoji-grid">
                    {#each commonEmojis as emoji}
                        <span onclick={() => addEmoji(emoji)}>{emoji}</span>
                    {/each}
                </div>
            </div>
        {/if}

        <div class="input-tray">
            <div class="action-row">
                <input type="file" id="chat-file-upload" accept="image/*" style="display: none;" onchange={handleFileUpload} />
                
                <button class="action-btn" title="Upload Image" onclick={() => document.getElementById('chat-file-upload').click()}>
                    <span class="material-icons">image</span>
                </button>
                <button class="action-btn" title="Search GIFs" onclick={() => { showGifTray = !showGifTray; showEmojiTray = false; }}>
                    <span class="material-icons" style="color: {showGifTray ? 'var(--accent-secondary)' : '#94a3b8'}">gif_box</span>
                </button>
                <button class="action-btn" title="Emojis" onclick={() => { showEmojiTray = !showEmojiTray; showGifTray = false; }}>
                    <span class="material-icons" style="color: {showEmojiTray ? 'var(--accent-secondary)' : '#94a3b8'}">mood</span>
                </button>
                
                {#if isUploading}
                    <span style="color: var(--accent-secondary); font-size: 0.8em; margin-left: auto; align-self: center;">Uploading...</span>
                {/if}
            </div>

            <div class="text-input-row">
                <input type="text" class="chat-input" placeholder="Message the league..." bind:value={newMessage} onkeydown={handleKeydown} />
                <button onclick={() => sendMessage(newMessage)} style="background: var(--accent-secondary); color: #0b0e14; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <span class="material-icons" style="font-size: 20px;">send</span>
                </button>
            </div>
        </div>
    </div>
{/if}