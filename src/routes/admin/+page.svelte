<script>
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';

    let title = '';
    let content = '';
    let videoFile;
    let uploading = false;
    let user = null;
    let profile = null;

    onMount(async () => {
        const { data } = await supabase.auth.getUser();
        user = data.user;
        if (user) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('team_name')
                .eq('id', user.id)
                .single();
            profile = profileData;
        }
    });

    async function handlePost() {
        if (!user) return alert("Please log in first");
        uploading = true;

        let videoUrl = null;
        if (videoFile) {
            const fileExt = videoFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('blog-videos')
                .upload(fileName, videoFile);
            
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('blog-videos').getPublicUrl(fileName);
            videoUrl = urlData.publicUrl;
        }

        const { error } = await supabase.from('blog_posts').insert({
            title,
            content,
            video_url: videoUrl,
            author_id: user.id,
            team_name: profile.team_name
        });

        if (error) alert(error.message);
        else alert("Post successful!");
        uploading = false;
    }
</script>

<div class="admin-panel">
    {#if user}
        <h2>Welcome, {profile?.team_name || 'Team Owner'}</h2>
        <input bind:value={title} placeholder="Post Title" />
        <textarea bind:value={content} placeholder="Write your post here..."></textarea>
        
        <label>Upload Video: <input type="file" accept="video/*" on:change={(e) => videoFile = e.target.files[0]} /></label>
        
        <button onclick={handlePost} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Submit Post'}
        </button>
    {:else}
        <p>Please log in with the credentials provided by the commissioner.</p>
        {/if}
</div>

<style>
    .admin-panel { max-width: 600px; margin: 50px auto; display: flex; flex-direction: column; gap: 1rem; }
    textarea { height: 200px; }
</style>