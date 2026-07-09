<script>
    import { activeLeague } from '$lib/stores/leagueContext.js';
    import { supabase } from '$lib/supabaseClient';
    import Button, { Label } from '@smui/button';

    let logoFile = $state(null);
    let isSaving = $state(false);
    let successMessage = $state('');

    async function saveSettings() {
        if (!$activeLeague?.id || !$activeLeague?.is_commissioner) {
            successMessage = 'Error: You do not have permission to edit this league.';
            return;
        }
        
        isSaving = true;
        successMessage = '';

        try {
            const rawHomepageText = document.getElementById('homepage-input').value;
            const rawConstitutionText = document.getElementById('constitution-input').value;

            let logoUrl = $activeLeague.logo_url;

            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${$activeLeague.id}_logo_${Math.random()}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('league-logos')
                    .upload(fileName, logoFile);
                    
                if (uploadError) {
                    throw new Error('Error uploading logo: ' + uploadError.message);
                }
                
                const { data: urlData } = supabase.storage.from('league-logos').getPublicUrl(fileName);
                logoUrl = urlData.publicUrl;
            }

            const { error } = await supabase
                .from('leagues')
                .update({ 
                    homepage_text: rawHomepageText,
                    constitution_text: rawConstitutionText,
                    logo_url: logoUrl
                })
                .eq('id', $activeLeague.id);

            if (!error) {
                $activeLeague.homepage_text = rawHomepageText;
                $activeLeague.constitution_text = rawConstitutionText;
                $activeLeague.logo_url = logoUrl;
                successMessage = 'Settings saved successfully!';
                logoFile = null; 
                setTimeout(() => successMessage = '', 3000);
            } else {
                throw new Error('Database Error: ' + error.message);
            }
        } catch (err) {
            console.error("Save Crash:", err);
            successMessage = err.message || 'An unexpected error occurred.';
        } finally {
            isSaving = false;
        }
    }
</script>

<style>
    .settings-container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
    .settings-card { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; backdrop-filter: blur(10px); }
    
    h1 { color: #f8fafc; margin-top: 0; font-size: 2.5em; line-height: 1.3; padding-top: 5px; font-weight: 800; }
    h2 { color: var(--accent-secondary); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-top: 30px; }
    
    .input-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }
    label { color: #94a3b8; font-weight: bold; }
    
    textarea { 
        width: 100%; height: 150px; 
        background: rgba(255, 255, 255, 0.05); 
        border: 1px solid rgba(255,255,255,0.1); 
        border-radius: 8px; color: #f8fafc; 
        padding: 15px; font-family: inherit; 
        resize: vertical; outline: none; 
        box-sizing: border-box; 
    }
    textarea:focus { border-color: var(--accent-secondary); }
    .constitution-box { height: 400px; }
    
    .upload-area { 
        display: flex; align-items: center; gap: 20px; 
        background: rgba(255, 255, 255, 0.03); 
        border: 1px dashed rgba(255,255,255,0.1); 
        padding: 20px; border-radius: 8px; 
        width: 100%; box-sizing: border-box; 
    }
    .preview-logo { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 2px solid var(--accent-secondary); }
    .file-input { color: #f8fafc; font-size: 0.9em; }
    .success { color: #10b981; font-weight: bold; margin-top: 15px; text-align: center; }
</style>

<div class="settings-container">
    <h1>Settings</h1>
    <div class="settings-card">
        {#if $activeLeague?.is_commissioner}
            <h2>Commissioner Settings</h2>
            
            <div class="input-group">
                <label>League Logo Header Image</label>
                <div class="upload-area">
                    {#if $activeLeague.logo_url && !logoFile}
                        <img src={$activeLeague.logo_url} alt="Current Logo" class="preview-logo"/>
                    {/if}
                    <input type="file" accept="image/*" onchange={(e) => logoFile = e.target.files[0]} class="file-input" />
                </div>
            </div>

            <div class="input-group">
                <label>Homepage Welcome Text</label>
                <textarea id="homepage-input" value={$activeLeague.homepage_text || ''} placeholder="Write a welcome message..."></textarea>
            </div>

            <div class="input-group">
                <label>League Constitution</label>
                <textarea id="constitution-input" class="constitution-box" value={$activeLeague.constitution_text || ''} placeholder="Enter your league rules, payouts, and constitution..."></textarea>
            </div>

            <Button variant="raised" style="background-color: var(--accent-secondary); color: #0b0e14; font-weight: 800;" onclick={saveSettings} disabled={isSaving}>
                <Label>{isSaving ? 'Saving...' : 'Save Settings'}</Label>
            </Button>

            {#if successMessage}
                <div class="success">{successMessage}</div>
            {/if}
        {:else}
            <div style="color: #94a3b8; font-style: italic;">Only the commissioner can edit league settings.</div>
        {/if}
    </div>
</div>