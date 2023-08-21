<script lang="ts">
  
  import { onMount } from 'svelte';
  import {GameClient} from '../../../client/src/client';
  import userState from '../../state/user';
    import { get } from 'svelte/store';

  onMount(async () => {
    let playerIds = [];
    get(userState).game.players.map(p => playerIds.push(p.userid));
    console.log('PLAYERS RECEIVED', playerIds);
    const canvas  = document.getElementById('canvas') as HTMLCanvasElement;
    const clientId =get(userState).userid;
    const otherPlayerIds = playerIds.filter(p => p !== clientId);
    const gameClient = await GameClient.initialize(clientId);
    await gameClient.startGame($userState.game._id, otherPlayerIds);
    console.log('other players', otherPlayerIds.length);
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