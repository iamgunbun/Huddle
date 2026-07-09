<script>
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

    // Simulates an incoming message (for testing the notification badge)
    export function simulateIncomingMessage() {
        messages = [...messages, { sender: 'League Mate', text: 'Who wants this trade?', type: 'text' }];
        if (!chatOpen) unreadCount++;
    }

    function toggleChat() {
        chatOpen = !chatOpen;
        if (chatOpen) {
            unreadCount = 0;
            showGifTray = false;
            showEmojiTray = false;
        }
    }

    async function sendMessage(content, type = 'text') {
        if (type === 'text' && content.trim() === '') return;
        
        messages = [...messages, { sender: 'You', text: content, type: type }];
        newMessage = '';
        showGifTray = false;
        showEmojiTray = false;

        // TODO: Add supabase.from('messages').insert(...) here for real-time backend
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        isUploading = true;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        const { error } = await supabase.storage.from('chat-media').upload(fileName, file);

        if (!error) {
            const { data } = supabase.storage.from('chat-media').getPublicUrl(fileName);
            sendMessage(data.publicUrl, 'image');
        } else {
            console.error("Upload failed:", error);
        }
        isUploading = false;
    }

    async function searchGifs() {
        if (!gifQuery) return;
        try {
            // Using Giphy's public beta API for instant, reliable testing
            const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${gifQuery}&limit=12`);
            const data = await res.json();
            gifResults = data.data || [];
        } catch (err) {
            console.error("GIF Fetch Error:", err);
            gifResults = [];
        }
    }

    function addEmoji(emoji) {
        newMessage += emoji;
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
        box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 9999; transition: all 0.2s;
    }
    .chat-trigger:hover { background: rgba(11, 14, 20, 0.95); border-color: rgba(238, 191, 28, 0.8); }

    .notification-badge {
        position: absolute; top: -8px; right: -8px;
        background: #ef4444; color: white; font-weight: 800;
        font-size: 0.75em; padding: 4px 8px; border-radius: 12px;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
    }

    .chat-window {
        position: fixed; bottom: 85px; right: 25px; width: 360px; height: 550px;
        background: rgba(11, 14, 20, 0.95); backdrop-filter: blur(20px);
        border: 1px solid rgba(238, 191, 28, 0.3); border-radius: 16px;
        display: flex; flex-direction: column; z-index: 9999;
        box-shadow: 0 10px 40px rgba(0,0,0,0.7); overflow: hidden;
    }

    .messages-area { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; }
    
    .message-bubble {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        padding: 10px 14px; border-radius: 12px; font-size: 0.9em; width: max-content; max-width: 85%;
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

    /* Pop-up Trays */
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
        <!-- Header -->
        <div style="padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3);">
            <span style="color: var(--accent-secondary); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                {$activeLeague?.league_name || 'Huddle Chat'}
            </span>
            <IconButton class="material-icons" onclick={() => chatOpen = false} style="color: #ef4444; margin: -10px;">close</IconButton>
        </div>

        <!-- Messages Area -->
        <div class="messages-area">
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

        <!-- Utility Trays (GIFs & Emojis) -->
        {#if showGifTray}
            <div class="utility-tray">
                <div style="display: flex; gap: 10px;">
                    <input type="text" placeholder="Search Giphy..." bind:value={gifQuery} class="chat-input" onkeydown={(e) => e.key === 'Enter' && searchGifs()} />
                    <button onclick={searchGifs} style="background: var(--accent-secondary); color: #000; border: none; border-radius: 6px; padding: 0 15px; font-weight: bold; cursor: pointer;">GO</button>
                </div>
                <div class="gif-grid">
                    {#each gifResults as gif}
                        <img 
                            src={gif.images.fixed_height_small.url} 
                            alt="gif result" 
                            onclick={() => sendMessage(gif.images.downsized_medium.url, 'gif')} 
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

        <!-- Bottom Input Area -->
        <div class="input-tray">
            <div class="action-row">
                <!-- Hidden File Input -->
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
                <input type="text" class="chat-input" placeholder="Message the league..." bind:value={newMessage} onkeydown={(e) => e.key === 'Enter' && sendMessage(newMessage)} />
                <button onclick={() => sendMessage(newMessage)} style="background: var(--accent-secondary); color: #0b0e14; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <span class="material-icons" style="font-size: 20px;">send</span>
                </button>
            </div>
        </div>
    </div>
{/if}