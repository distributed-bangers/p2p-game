<script lang="ts">
    import { getAllGames } from "../services/gameService";
    import type { IHighscore } from "../models/game";
    import { onMount } from 'svelte';


    export let showHighscoreModal;

    let dialog;
    let showLoadingSpinner = false;
    let highscore;
  
    $: if (dialog && showHighscoreModal) dialog.showModal();

    onMount (async () => {
      try {
        showLoadingSpinner = true;
        let dict = {}
        const res = await getAllGames({closed: true});
        const allClosedGames = res.data.games;
        for (const game of allClosedGames){
          const winner = game.winner.username;
          dict[winner] ? dict[winner]++ : dict[winner] = 1
        }
        highscore = Object.entries(dict)
        highscore.sort((a,b) => b[1] - a[1]);
        highscore.slice(0,10);
        showLoadingSpinner = false;
        console.log(highscore)
      } catch (error) {
        alert(error.message)
        showLoadingSpinner = false;
      }
    })
  </script>

{#if showLoadingSpinner}
<div id="loading"></div>
{/if}
  
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog
    bind:this={dialog}
    on:close={() => ((showHighscoreModal = false))}
    on:click|self={() => dialog.close()}
  >
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div>
      <h2>Highscore: Top 10</h2>
      {#if highscore}
      {#if highscore.length==0}
      <p>No winning games found... Play a game and become a champion!</p>
      {/if}
      <ol>
        {#each highscore as entry}
        <li>{entry[0]} won {entry[1]} times </li>
        {/each}
      </ol>
      {:else}
      <p>Loading highscores...</p>
      {/if}

      <div id="buttonDiv">
        <button class="button" on:click={() => dialog.close()}>Close</button>
      </div>
    </div>
  </dialog>
  
  <style>
  
    #buttonDiv {
      display: flex;
      justify-content: space-evenly;
    }

    dialog {
      max-width: 32em;
      min-width: 25em;
      border-radius: 0.2em;
      border: none;
      padding: 0;
    }
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.3);
    }
    dialog > div {
      padding: 1em;
    }
    dialog[open] {
      animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes zoom {
      from {
        transform: scale(0.95);
      }
      to {
        transform: scale(1);
      }
    }
    dialog[open]::backdrop {
      animation: fade 0.2s ease-out;
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    button {
      display: block;
    }
  </style>
  