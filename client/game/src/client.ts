import PeerClient from './peerClient'
import { DataConnection, PeerJSOption } from 'peerjs'
import Renderer from './renderer'
import { Bullet, Player } from './game/objects'
import { isSceneSnapshot, SceneSnapshot } from './game/snapshots'

/**
 * The GameState is an Object containing the state of each player in the game indexed by their respective id.
 */
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

/**
 * Central Class for game logic.
 */
export class GameClient {
  private readonly id: string;

  private peerClient: PeerClient;
  private peers: Peer[] = [];

    gameId?: string
    renderer?: Renderer
    state: GameState = {}

    /**
     * This constructor is only meant to be called by the {@link initialize} method.
     * By doing this the {@link GameClient} is guaranteed to have an initialized {@link PeerClient}.
     * As {@link id} for the client the {@link PeerClient.id} is used.
     * @param peerClient
     * @private
     */
    private constructor(peerClient: PeerClient) {
        this.peerClient = peerClient
        this.peerClient.on('connection', (dataConnection) => {
            this.onConnection(dataConnection)
        })

        this.id = peerClient.id
    }

    /**
     * Initializes a {@link PeerClient} and uses it to call the {@link constructor}.
     * @param id Both the {@link PeerClient} and {@link GameClient} will use this id.
     * @param options Options for the {@link PeerClient} ({@link PeerJSOption}).
     */
    static async initialize(id?: string, options?: { host: string, port: number, path: string }) {
        const peerClient = await PeerClient.initialize(id, options)

        return new GameClient(peerClient)
    }

    /**
     * Returns the {@link Player} controlled by this {@link GameClient}.
     */
    get player(): Player {
        return this.state[this.id]
    }

    /**
     * Initializes
     * @param gameId
     * @param users An array of ids of other {@link GameClient}s
     */
    async startGame(gameId: string, users: string[]) {
        this.gameId = gameId
        this.renderer = new Renderer(this)

        this.addPlayer(this.id, new Player('blue'))

        document.addEventListener('keydown', (ev) => this.onKeyDown(ev, this))
        document.addEventListener('keyup', (ev) => this.onKeyUp(ev, this))
        window.addEventListener('resize', () => this.renderer?.resize(window.innerWidth, window.innerHeight))

    for (const user of users) {
      await this.connect(user);
    }
  }

    // close all peerclient connections
    // delete scenes and renderers
    //
    endGame() {
        this.peers.forEach(peer => peer.connection.close())
        delete this.gameId
        delete this.renderer
        this.state = {}
        this.peers = []

        // remove all event listeners
        document.removeEventListener('keydown', (ev) => this.onKeyDown(ev, this))
        document.removeEventListener('keyup', (ev) => this.onKeyUp(ev, this))
        window.removeEventListener('resize', () => this.renderer?.resize(window.innerWidth, window.innerHeight))
    }


    sendSnapshot() {
        const snapshot: SceneSnapshot = {
            bullets: this.player.bullets.map((bullet) => bullet.getSnapshot()),
            player: this.player.getSnapshot(),
        }

        for (const peer of this.peers) {
            peer.connection.send(snapshot)
        }
    }

    private async connect(id: string) {
        const dataConnection = await this.peerClient.uniqueConnect(id)

        this.onConnection(dataConnection)
    }

  onGameFinished(callBack: (highscore: number) => any) { }

  onPlayerDisconnect(playerId: string) {
    this.removePlayer(playerId);

    const peer = this.peers.find(({ id }) => id === playerId);

    if (peer) {
      peer.connection.close();

      this.peers.splice(this.peers.indexOf(peer), 1);
    }
  }

  private onConnection(dataConnection: DataConnection) {
    const id = dataConnection.peer;
    const peer: Peer = { id: id, connection: dataConnection };
    this.peers.push(peer);

    // const player = ;

        dataConnection.on('data', (data) => {
            if (isSceneSnapshot(data)) {
                this.onSceneSnapshot(id, data)
            }
        })
    }

  private addPlayer(id: string, player: Player) {
    this.state[id] = player;
    this.renderer?.addObject(player);
  }

  private removePlayer(id: string) {
    const player = this.state[id];
    delete this.state[id];

    for (const bullet of player.bullets) {
      this.renderer?.removeObject(bullet);
    }

    this.renderer?.removeObject(player);
  }

    private onSceneSnapshot(id: string, snapshot: SceneSnapshot) {
        const player = this.state[id]
        player.setFromSnapshot(snapshot.player)

        while (player.bullets.length !== snapshot.bullets.length) {
            if (player.bullets.length < snapshot.bullets.length) {
                player.spawnBullet()
            } else {
                this.renderer?.scene.remove(player.bullets.pop() as Bullet)
            }
        }

        player.bullets.forEach((bullet, index) =>
            bullet.setFromSnapshot(snapshot.bullets[index]),
        )
    }

    private onKeyDown(event: KeyboardEvent, client: GameClient) {
        const inputs = client.player.inputs

        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                inputs.moveUp = true
                break
            case 'ArrowLeft':
            case 'KeyA':
                inputs.moveLeft = true
                break
            case 'ArrowDown':
            case 'KeyS':
                inputs.moveDown = true
                break
            case 'ArrowRight':
            case 'KeyD':
                inputs.moveRight = true
                break
            case 'Space':
                inputs.shoot = true
                break
        }
    }

    private onKeyUp(event: KeyboardEvent, client: GameClient) {
        const inputs = client.player.inputs

        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                inputs.moveUp = false
                break
            case 'ArrowLeft':
            case 'KeyA':
                inputs.moveLeft = false
                break
            case 'ArrowDown':
            case 'KeyS':
                inputs.moveDown = false
                break
            case 'ArrowRight':
            case 'KeyD':
                inputs.moveRight = false
                break
            case 'Space':
                inputs.shoot = false
                break
        }
    }
}
