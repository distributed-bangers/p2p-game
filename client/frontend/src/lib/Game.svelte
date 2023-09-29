<script lang="ts">
  
  import { onMount } from 'svelte';
  import {GameClient} from '../../../game/src/client';
  import userState from '../../state/user';
  import { get } from 'svelte/store';
  

  const peerserverHost = import.meta.env.VITE_PEER_SERVER_HOST;
  const peerserverPort = import.meta.env.VITE_PEER_SERVER_PORT;
  const peerserverPath = import.meta.env.VITE_PEER_SERVER_PATH;

  onMount(async () => {
    let playerIds = [];
    get(userState).game.players.map(p => playerIds.push(p.userid));
    console.log('PLAYERS RECEIVED', playerIds);
    const canvas  = document.getElementById('canvas') as HTMLCanvasElement;
    const clientId =get(userState).userid;
    console.log('myPlayer: ', clientId)
    const otherPlayerIds = playerIds.filter(p => p !== clientId);
    console.log('otherPlayers: ', otherPlayerIds)
    const gameClient = await GameClient.initialize(clientId, {
      host: peerserverHost,
      port: peerserverPort,
      path: peerserverPath,
    });
    await gameClient.startGame($userState.game._id, otherPlayerIds);
    console.log('AFTER START GAME', otherPlayerIds.length);
    gameClient.renderer.setCanvas(canvas, canvas.clientWidth, canvas.clientHeight);
  });

</script>

  <canvas id="canvas"></canvas>

<style>
#canvas {
    width: 100vw;
    height: 100vh;
  }
</style>