<script lang="ts">
  import type { Game } from '../models/game';
  import type { User } from '../models/user';
  import userState from '../../state/user';
  import { createGame, getAllGames, joinGame } from '../services/gameService';
  import { onMount, onDestroy } from 'svelte';
  import CreateGameModal from './CreateGameModal.svelte';

  let selectedGame: Game = null;
  let openGames: Game[] = [];
  let showLoadingSpinner = false;
  let showCreateGameModal = false;

  onMount(async () => {
    $userState.game = null;
    try {
      showLoadingSpinner = true;
      const response = await getAllGames({ open: true });
      showLoadingSpinner = false;
      openGames = response.data.games;
    } catch (error) {
      alert(error.message);
      showLoadingSpinner = false;
    }
  });

  onDestroy(() => {
    console.log('DESTROY');
    openGames = [];
  });

  const onClickRefresh = async () => {
    try {
      showLoadingSpinner = true;
      const response = await getAllGames({ open: true });
      showLoadingSpinner = false;
      openGames = response.data.games;
    } catch (error) {
      alert(error.message);
      showLoadingSpinner = false;
    }
  };

  const onClickJoin = async () => {
    try {
      showLoadingSpinner = true;
      const response = await joinGame(selectedGame._id);
      showLoadingSpinner = false;
      $userState.game = response.data.game;
      $userState.isInGame = true;
    } catch (error) {
      alert(error.message);
      showLoadingSpinner = false;
    }
  };
  const onClickCreate = () => {
    showCreateGameModal = true;
  };

  const onCreateNewGame = async (gameName: string) => {
    try {
      showLoadingSpinner = true;
      const response = await createGame(gameName);
      const newGame = response.data.game;
      $userState.game = newGame;
      $userState.isInGame = true;
      showLoadingSpinner = false;
    } catch (error) {
      alert(error.message);
      showLoadingSpinner = false;
    }
  };
</script>

<CreateGameModal bind:showCreateGameModal {onCreateNewGame}></CreateGameModal>

{#if showLoadingSpinner}
  <div id="loading"></div>
{/if}

<div id="rootDiv">
  <h1 id="heading">Racoosh Lobby</h1>
  <h2>Hi there, {$userState.username} 😊</h2>
  <div id="cardDiv">
    <div id="tableDiv">
      <table id="lobbyTable">
        <tr class="gapOne">
          <th>Game</th>
          <th>Host</th>
          <th>Players</th>
        </tr>
        {#if openGames.length > 0}
          {#each openGames as game}
            <tr
              class={selectedGame === game ? 'hoverRow' : ''}
              on:click={(event) => {
                selectedGame = game;
              }}
            >
              <td>{game.name}</td>
              <td>{game.host.username}</td>
              <td>
                {game.players.length}/4
              </td>
            </tr>
          {/each}
        {:else}
          <td colspan="3">No open games found. Click refresh to try again.</td>
        {/if}
      </table>
    </div>
    <div id="buttonDiv">
      <button class="button" on:click={onClickRefresh}>Refresh</button>
      <button class="button" disabled={!selectedGame} on:click={onClickJoin}
        >Join Game</button
      >
      <button class="button" on:click={onClickCreate}>Create Game</button>
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
    height: 20em;
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

  .hoverRow {
    background-color: var(--selected-color);
    border-bottom: solid black 1px;
  }
</style>
