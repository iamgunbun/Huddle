<script>
    export let videoId;
</script>

<iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/{videoId}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
</iframe>

<style>
    iframe {
        max-width: 100%;
        max-height: 100%;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
</style>