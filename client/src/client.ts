import PeerClient from './peerClient';
import { DataConnection } from 'peerjs';
import Renderer from './renderer';
import { Bullet, Player } from './game/objects';
import { isSceneSnapshot, SceneSnapshot } from './game/snapshots';

interface GameState {
  [playerId: string]: Player;
}

interface Peer {
  connection: DataConnection;
  id: string;
}

export interface Inputs {
  moveDown: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  shoot: boolean;
}

export class GameClient {
  private readonly id: string;

  private peerClient: PeerClient;
  private peers: Peer[] = [];

  renderer: Renderer = new Renderer(this);

  gameId: string = '';
  player: Player = new Player('blue');
  state: GameState = {};

  private constructor(peerClient: PeerClient) {
    this.peerClient = peerClient;
    this.peerClient.on('connection', (dataConnection) => {
      this.onConnection(dataConnection);
    });

    this.id = peerClient.id;
    this.state[this.id] = this.player;
    this.renderer.addPlayer(this.player);

    document.addEventListener('keydown', (ev) => this.onKeyDown(ev, this));
    document.addEventListener('keyup', (ev) => this.onKeyUp(ev, this));
  }

  async startGame(gameId: string, users: string[]) {
    this.gameId = gameId;

    const promises = [];

    for (let index = 0; index < users.length; index++) {
      promises.push(this.connect(users[index]).then());
    }

    return Promise.all(promises);
  }

  onGameFinished(callBack: (highscore: number) => any) {}

  static async initialize(id?: string) {
    const peerClient = await PeerClient.initialize(id);

    return new GameClient(peerClient);
  }

  private onConnection(dataConnection: DataConnection) {
    const peer: Peer = { id: dataConnection.peer, connection: dataConnection };
    this.peers.push(peer);

    const player = new Player('red');
    this.state[peer.id] = player;
    this.renderer.addPlayer(player);

    dataConnection.on('data', (data) => {
      if (isSceneSnapshot(data)) {
        const player = this.state[dataConnection.peer];
        player.setFromSnapshot(data.player);

        while (player.bullets.length !== data.bullets.length) {
          if (player.bullets.length < data.bullets.length) {
            player.spawnBullet();
          } else {
            this.renderer.scene.remove(player.bullets.pop() as Bullet);
          }
        }

        player.bullets.forEach((bullet, index) =>
          bullet.setFromSnapshot(data.bullets[index])
        );
      }
    });
  }

  private onKeyDown(event: KeyboardEvent, client: GameClient) {
    const inputs = client.player.inputs;

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        inputs.moveUp = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        inputs.moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        inputs.moveDown = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        inputs.moveRight = true;
        break;
      case 'Space':
        inputs.shoot = true;
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent, client: GameClient) {
    const inputs = client.player.inputs;

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        inputs.moveUp = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        inputs.moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        inputs.moveDown = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        inputs.moveRight = false;
        break;
      case 'Space':
        inputs.shoot = false;
        break;
    }
  }

  async connect(id: string) {
    const dataConnection = await this.peerClient.uniqueConnect(id);

    this.onConnection(dataConnection);
  }

  sendSnapshot() {
    const snapshot: SceneSnapshot = {
      bullets: this.player.bullets.map((bullet) => bullet.getSnapshot()),
      player: this.player.getSnapshot(),
    };

    for (const peer of this.peers) {
      peer.connection.send(snapshot);
    }
  }
}
