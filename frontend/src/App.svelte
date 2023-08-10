<script lang="ts">
  import Auth from './lib/Auth.svelte';
  import userState from '../state/user';
  import Lobby from './lib/Lobby.svelte';
  import GameLobby from './lib/GameLobby.svelte';
</script>

<main>
  {#if !$userState.authenticated}
    <Auth />
  {:else if !$userState.isInGame && $userState.authenticated}
    <Lobby />
  {:else if $userState.isInGame && $userState.authenticated}
    <GameLobby />
  {/if}
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    text-align: center;
  }
</style>
