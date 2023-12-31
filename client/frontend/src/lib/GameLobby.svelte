<script>
  import { get } from 'svelte/store';
  import userState from '../../state/user';
  import { deleteGame, leaveGame, startGame } from '../services/gameService';
  import Game from './Game.svelte';
  import { maxNumberOfPlayers } from '../shared/constants';

  let showLoadingSpinner = false;
  let amIHost = false;
  let gameFull = false;

  $: {
    amIHost = $userState.game.host.userid === $userState.userid;
    gameFull = $userState.game.players.length === maxNumberOfPlayers;
  }

  const onClickStartGame = async () => {
    try {
      let game;
      showLoadingSpinner = true;
      if (amIHost) {
        game = await startGame($userState.game._id);
          }
      else throw new Error('Only the host can start the game!');

      //* Overwriting host's gameState, because the startGame endpoint copies players into activePlayers
      $userState.game = game.data.game;
      $userState.isInGameLobby = false;
      $userState.isInGame = true;
      
      showLoadingSpinner = false;
  
    } catch (error) {
      alert(error.message);
      showLoadingSpinner = false;
    }

    //! 1. host calls startgame api and receives game back
    //! 2. host emits startgame event via socketio to all players, shares data of all players (synchronizes all players)
  };

  const onClickLeaveGame = async () => {
    try {
      showLoadingSpinner = true;

      //* Deletes game and ends all socket-connections if player==host, else only leavesGame
      if (amIHost) await deleteGame($userState.game._id);
      else await leaveGame($userState.game._id);

      showLoadingSpinner = false;
      $userState.isInGameLobby = false;
    } catch (error) {
      alert(error.message);
      showLoadingSpinner = false;
      $userState.isInGameLobby = false;
    }
  };
</script>

{#if showLoadingSpinner}
  <div id="loading"></div>
{/if}

<div id="rootDiv">
  <h1 id="heading">Welcome to {get(userState).game.name}</h1>
  <h2>
    {amIHost
      ? 'You can start the game as soon as all players have joined!'
      : 'Waiting for host to start the game...'}
  </h2>
  <div id="cardDiv">
    <div id="tableDiv">
      <table id="lobbyTable">
        <tr class="gapOne">
          <th>Player name</th>
          <th>Player status</th>
        </tr>
        {#each $userState.game.players as player}
          <tr>
            <td>{player.username}</td>
            <td>
              {#if $userState.game.host.userid === player.userid}
                Host
              {:else}
                Player
              {/if}
            </td>
          </tr>
        {/each}
      </table>
    </div>
    <div>
      <span
      class:greenSpan={gameFull}
      class:redSpan={!gameFull}
      >
        {$userState.game.players.length}/{maxNumberOfPlayers} players joined
      </span>
      <div id="buttonDiv">
        <button class="button" on:click={onClickLeaveGame}>Leave Game</button>
        <button
          class="button"
          on:click={onClickStartGame}
          class:disabledButton={(!amIHost || !gameFull) ? true : false}
          disabled={(!amIHost || !gameFull) ? true : false}>Start Game</button
          >
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    --selected-color: rgb(145, 165, 177);
  }

  .button {
    margin: 1em;

    box-shadow:
      rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
      rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  }

  .disabledButton{
    opacity: 0.5;
    cursor: default;
  }

  .redSpan{
    color: red;
  }

  .greenSpan{
    color: green;
  }

  #rootDiv {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #heading {
    width: 100%;
    position: absolute;
    top: 0;
    margin-top: 5vh;
    z-index: 1;
  }

  #cardDiv {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 40em;
    height: 15em;
    background-color: rgb(235, 235, 235);
    box-shadow:
      rgba(0, 0, 0, 0.25) 0px 54px 55px,
      rgba(0, 0, 0, 0.12) 0px -12px 30px,
      rgba(0, 0, 0, 0.12) 0px 4px 6px,
      rgba(0, 0, 0, 0.17) 0px 12px 13px,
      rgba(0, 0, 0, 0.09) 0px -3px 5px;
  }

  #tableDiv {
    overflow: auto;
  }

  #buttonDiv {
    display: flex;
    justify-content: space-evenly;
  }

  #lobbyTable {
    width: 100%;
    /* overflow: auto; */
    border-style: hidden;
    border-collapse: collapse;
  }

  th {
    background-color: rgb(162, 162, 162);
    position: sticky;
    top: 0;
  }

  tr {
    border: 1px solid transparent;
  }

  tr:not(:first-child):hover {
    cursor: pointer;
    background-color: var(--selected-color);
    border-bottom: solid black 1px;
    /* background-color: var(--selected-color); */
  }
</style>
