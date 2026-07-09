<script>
    export let sideOne, sideTwo, label, unit;
</script>

<style>
    .enclosure {
        padding: 10px 8px;
        text-align: center;
    }
    .gray_bar {
        position: relative;
        height: 12px;
        border-radius: 6px;
        width: 75%;
        margin: 0 auto;
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
        overflow: hidden;
    }
    .side {
        position: absolute;
        height: 100%;
        top: 0;
    }
    .side_one {
        background-color: var(--accent-secondary, #eebf1c);
        right: 50%;
        border-radius: 6px 0 0 6px;
    }
    .side_two {
        background-color: var(--accent-primary, #04351e);
        left: 50%;
        border-radius: 0 6px 6px 0;
    }
    
    /* FIXED: Forcing bright text color to prevent hiding against dark background */
    .stat {
        color: #f8fafc;
        font-weight: 600;
        font-size: 1.05em;
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    }
    
    .oneWinner, .twoWinner {
        color: var(--accent-secondary, #eebf1c);
        font-weight: 800;
        text-decoration: none;
        text-shadow: 0 0 10px rgba(238, 191, 28, 0.4);
    }
    
    h4 {
        text-align: center;
        font-size: 1.3em;
        margin: 10px 0;
        color: #f8fafc;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .stats {
        display: flex;
        width: 75%;
        margin: 10px auto 0;
        justify-content: space-between;
    }
    @media (max-width: 650px) {
        h4 { font-size: 1.1em; }
        .stat { font-size: 0.9em; }
    }
</style>

<h4>{label}</h4>
<div class="enclosure">
    <div class="gray_bar">
        <div class="side side_one" style="width: {sideOne / (sideOne + sideTwo) * 50}%"/>
        <div class="side side_two" style="width: {sideTwo / (sideOne + sideTwo) * 50}%"/>
    </div>
    <div class="stats">
        <span class="stat{sideOne > sideTwo ? ' oneWinner' : ''}">{sideOne} {unit}</span>
        <span class="stat{sideTwo > sideOne ? ' twoWinner' : ''}">{sideTwo} {unit}</span>
    </div>
</div>