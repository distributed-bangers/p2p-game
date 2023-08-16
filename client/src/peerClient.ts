import { DataConnection, Peer, PeerConnectOption } from 'peerjs'

export default class PeerClient extends Peer {
    readonly peers = new Set<string>()

    private constructor(id = '') {
        super(id)
    }

    static async initialize(id?: string): Promise<PeerClient> {
        const peerClient = new PeerClient(id)

        return new Promise(resolve => peerClient.on('open', () => {
            console.log(`peer id is ${peerClient.id}`)
            resolve(peerClient)
        }))
    }

    async asyncConnect(peerId: string, options?: PeerConnectOption): Promise<DataConnection> {
        const dataConnection = this.connect(peerId, options)

        return new Promise<DataConnection>(resolve => dataConnection.on('open', () => {
            console.log(`connection to ${peerId} established`)
            this.peers.add(peerId)

            dataConnection.on('close', () => {
                this.peers.delete(peerId)
            })

            resolve(dataConnection)
        }))
    }

    /**
     * Only establishes a DataConnection if no other DataConnection to that peer is open.
     * @param peerId
     * @param options
     */
    async uniqueConnect(peerId: string, options?: PeerConnectOption): Promise<DataConnection> {
        return new Promise<DataConnection>((resolve, reject) => {
            if (this.peers.has(peerId)) {
                reject(`connection to ${peerId} already exists`)
            }

            resolve(this.asyncConnect(peerId, options))
        })
    }

    async joinLobby(lobbyId: string) {

    }
}

// Peer Test
async function testPeer() {
    const peer = await PeerClient.initialize()

    const peer2 = await PeerClient.initialize()
    const dataConnection = await peer.asyncConnect(peer2.id)
    const data = prompt('Message', 'Hi!')

    dataConnection.send(data)
}
