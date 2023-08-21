<script>
  import { onMount } from 'svelte';
  import {gameClient} from '../../../client/src/client';
  import userState from '../../state/user';
    import { get } from 'svelte/store';

  onMount(async () => {
    let playerIds = [];
    get(userState).game.players.map(p => playerIds.push(p.userid));
    console.log('PLAYERS RECEIVED', playerIds);
    gameClient.startGame($userState.game._id, playerIds);
  });


  const onGameFinishes = async () => {


  };

</script>

<canvas id="canvas"></canvas>