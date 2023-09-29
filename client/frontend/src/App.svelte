<script lang="ts">
  import Auth from './lib/Auth.svelte';
  import userState from '../state/user';
  import Lobby from './lib/Lobby.svelte';
  import GameLobby from './lib/GameLobby.svelte';
  import Game from './lib/Game.svelte';
</script>

<main>
  // If the user is not authenticated, show the auth component
  {#if !$userState.authenticated}
    <Auth />
  // If the user is authenticated, but is not in a game lobby or game, show the lobby component
  {:else if !$userState.isInGameLobby && !$userState.isInGame}
    <Lobby />
  // If the user is in a game lobby, but not in a game, show the game lobby component
  {:else if $userState.isInGameLobby && !$userState.isInGame}
    <GameLobby />
  // If the user is in a game, show the game component
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
