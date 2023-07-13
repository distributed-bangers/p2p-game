import { DataConnection, Peer, PeerConnectOption } from 'peerjs'

class PeerClient extends Peer {
    private constructor() {
        super()

        this.on('connection',
            dataConnection => dataConnection.on('data', data => console.log(`peer ${this.id} received ${data}`)),
        )
    }

    static async initialize(): Promise<PeerClient> {
        const peerClient = new PeerClient()

        return new Promise(resolve => peerClient.on('open', () => {
            resolve(peerClient)
        }))
    }

    async asyncConnect(peerId: string, options?: PeerConnectOption): Promise<DataConnection> {
        const dataConnection = this.connect(peerId, options)

        return new Promise<DataConnection>(resolve => dataConnection.on('open', () => {
            console.log(`connection to ${peerId} established`)

            resolve(dataConnection)
        }))
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
