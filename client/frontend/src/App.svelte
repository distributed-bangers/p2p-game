<script lang="ts">
  import Auth from './lib/Auth.svelte';
  import userState from '../state/user';
  import Lobby from './lib/Lobby.svelte';
  import GameLobby from './lib/GameLobby.svelte';
  import Game from './lib/Game.svelte';
</script>

<main>
  {#if !$userState.authenticated}
    <Auth />
  {:else if !$userState.isInGameLobby && !$userState.isInGame}
    <Lobby />
  {:else if $userState.isInGameLobby && !$userState.isInGame}
    <GameLobby />
  {:else if $userState.isInGame && !$userState.isInGameLobby}
    <Game />
  {/if}
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    text-align: center;
  }
</style>
