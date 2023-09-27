<script lang="ts">
  
  import { onMount } from 'svelte';
  import {GameClient} from '../../../game/src/client';
  import userState from '../../state/user';
  import { get } from 'svelte/store';
  

  const peerserverHost = import.meta.env.VITE_PEER_SERVER_HOST;
  const peerserverPort = import.meta.env.VITE_PEER_SERVER_PORT;
  const peerserverPath = import.meta.env.VITE_PEER_SERVER_PATH;

  function getOtherPlayerIds (myId: string) {
    const playerIds = get(userState).game.players.map(p => p.userid);
    return playerIds.filter(p => p !== myId);
  }

  onMount(async () => {
    const canvas  = document.getElementById('canvas') as HTMLCanvasElement;
    const myId = get(userState).userid;
    const otherPlayerIds = getOtherPlayerIds(myId);

    const gameClient = await GameClient.initialize(myId, {
      host: peerserverHost,
      port: peerserverPort,
      path: peerserverPath,
    });

    await gameClient.startGame($userState.game._id, otherPlayerIds);
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