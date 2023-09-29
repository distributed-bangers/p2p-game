<script lang="ts">
  
  import { onDestroy, onMount } from 'svelte';
  import userState from '../../state/user';
  import { get } from 'svelte/store';
    import { on } from 'events';
    import { gameClient, initializeGameClient } from '../main';

  function getOtherPlayerIds (myId: string) {
    const playerIds = get(userState).game.players.map(p => p.userid);
    return playerIds.filter(p => p !== myId);
  }

  //* This is the entry point for starting the game client
  onMount(async () => {
    console.log('Game.svelte: onMount')
    const canvas  = document.getElementById('canvas') as HTMLCanvasElement;
    const myId = get(userState).userid;
    const otherPlayerIds = getOtherPlayerIds(myId);

    // initializing the game client
    await initializeGameClient(myId);

    // starting the game
    await gameClient.startGame($userState.game._id, otherPlayerIds);

    // starting the renderer
    gameClient.renderer.setCanvas(canvas, canvas.clientWidth, canvas.clientHeight);
  });

  onDestroy(() => {
    console.log('Game.svelte: onDestroy')
    //! HERE: gameclient needs to be properly disposed
    // TODO: stop the game client
    // gameClient.stopGame();
  });

</script>

  <canvas id="canvas"></canvas>

<style>
#canvas {
    width: 100vw;
    height: 100vh;
  }
</style>