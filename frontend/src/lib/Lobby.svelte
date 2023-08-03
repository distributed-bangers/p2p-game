<script lang="ts">
  import type { Game } from '../models/game';
  import type { User } from '../models/user';
  import userState from '../../state/user';

  const userOne: User = { userid: '1', username: 'user1' };
  const userTwo: User = { userid: '2', username: 'user3' };
  const userThree: User = { userid: '3', username: 'user3' };
  const userFour: User = { userid: '4', username: 'user4' };

  let selectedGame: Game = null;

  const myGames: Game[] = [
    {
      name: 'gameOne',
      host: userOne,
      players: [userOne, userTwo],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
    {
      name: 'gameOne',
      host: userThree,
      players: [userThree, userFour, userOne],
      finished: false,
      started: false,
    },
  ];

  const onClickJoin = () => {
    $userState.game = selectedGame;
  };
</script>

<div id="rootDiv">
  <h1 id="heading">Racoosh Lobby</h1>
  <div id="cardDiv">
    <div id="tableDiv">
      <table id="lobbyTable">
        <tr class="gapOne">
          <th>Game</th>
          <th>Host</th>
          <th>Players</th>
        </tr>

        {#each myGames as game}
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
      </table>
    </div>
    <div id="buttonDiv">
      <button class="button">Refresh</button>
      <button class="button" disabled={!selectedGame} on:click={onClickJoin}
        >Join Game</button
      >
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
