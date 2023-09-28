<script lang="ts">
  
  import { onMount } from 'svelte';
  import userState from '../../state/user';
  import { get } from 'svelte/store';
  import { gameClient, initializeGameClient } from '../main';

  function getOtherPlayerIds (myId: string) {
    const playerIds = get(userState).game.players.map(p => p.userid);
    return playerIds.filter(p => p !== myId);
  }

  //* This is the entry point for starting the game client
  onMount(async () => {
    const canvas  = document.getElementById('canvas') as HTMLCanvasElement;
    const myId = get(userState).userid;
    const otherPlayerIds = getOtherPlayerIds(myId);

    // initializing the game client
    await initializeGameClient(myId);

    // starting the game
    await gameClient.startGame($userState.game._id, otherPlayerIds);

    // starting the renderer
    gameClient.renderer.initialize(canvas, canvas.clientWidth, canvas.clientHeight);
  });

</script>

  <canvas id="canvas"></canvas>

<style>
#canvas {
    width: 100vw;
    height: 100vh;
  }
</style>