import { DataConnection, Peer, PeerConnectOption } from 'peerjs'

export default class PeerClient extends Peer {
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
