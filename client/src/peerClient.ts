import { DataConnection, Peer, PeerConnectOption } from 'peerjs'

/**
 * Wraps the PeerJS {@link Peer} class for asynchronous use.
 * TODO Define timeout behavior
 */
class PeerClient extends Peer {
    private constructor() {
        super()
    }

    /**
     * Initializes the PeerJs {@link Peer} and resolves when a connection to the PeerServer is
     * established.
     */
    static async initialize(): Promise<PeerClient> {
        const peerClient = new PeerClient()

        return new Promise(resolve => peerClient.on('open', () => {
            resolve(peerClient)
        }))
    }

    /**
     * Wraps {@link Peer.connect} method for asynchronous use.
     * Resolves once a connection to the other Peer is established or if the connection fails.
     * @param peerId The brokering ID of the remote peer (their peer.id).
     * @param options for specifying details about Peer Connection
     */
    async asyncConnect(peerId: string, options?: PeerConnectOption): Promise<DataConnection> {
        const dataConnection = this.connect(peerId, options)
        const timeout = 5000

        return new Promise<DataConnection>((resolve, reject) => {
            setTimeout(reject, timeout)

            dataConnection.on('open', () => {
                console.log(`connection to ${peerId} established`)

                resolve(dataConnection)
            })

            dataConnection.on('error', (error) => {
                console.error(`Connection to ${peerId} failed because of:`, error)

                reject(error)
            })
        })
    }

    async joinLobby(lobbyId: string) {

    }
}

// Peer Test
// TODO write tests for PeerClient
export async function testPeer() {
    const peer = await PeerClient.initialize()
    const peer2 = await PeerClient.initialize()

    const dataConnection = await peer.asyncConnect(peer2.id)
    const data = prompt('Message', 'Hi!')

    dataConnection.send(data)
}
