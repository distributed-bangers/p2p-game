<script>
  import Auth from './lib/Auth.svelte';
  import userState from '../state/user';
  import Lobby from './lib/Lobby.svelte';
</script>

<main>
  {#if !$userState.authenticated}
    <Auth />
  {:else}
    <Lobby />
  {/if}
</main>
