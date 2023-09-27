import { DataConnection, Peer, PeerConnectOption } from "peerjs";

/*
 * Wraps the PeerJS {@link Peer} class for asynchronous use.
 * TODO Define timeout behavior
 */
export default class PeerClient extends Peer {
  readonly peers = new Set<string>();

  private constructor(
    id = "",
    options = { host: "localhost", port: 5173, path: "/peerserver" },
  ) {
    super(id, options);
  }

  /*
   * Initializes the PeerJs {@link Peer} and resolves when a connection to the PeerServer is
   * established.
   */
  static async initialize(
    id?: string,
    options?: { host: string; port: number; path: string },
  ): Promise<PeerClient> {
    console.log("options", options);
    const peerClient = new PeerClient(id, options);

    return new Promise((resolve) =>
      peerClient.on("open", () => {
        console.log(`peer id is ${peerClient.id}`);
        resolve(peerClient);
      }),
    );
  }

  /**
   * Wraps {@link Peer.connect} method for asynchronous use.
   * Resolves once a connection to the other Peer is established or if the connection fails.
   * @param peerId The brokering ID of the remote peer (their peer.id).
   * @param options for specifying details about Peer Connection
   */
  async asyncConnect(
    peerId: string,
    options?: PeerConnectOption,
  ): Promise<DataConnection> {
    const dataConnection = this.connect(peerId, options);

    return new Promise<DataConnection>((resolve, reject) => {
      dataConnection.on("open", () => {
        this.peers.add(peerId);

        dataConnection.on("close", () => {
          this.peers.delete(peerId);
        });

        console.log(`connection to ${peerId} established`);
        resolve(dataConnection);
      });
      dataConnection.on("error", (error) => {
        console.error(`Connection to ${peerId} failed because of:`, error);

        reject(error);
      });
    });
  }

  /**
   * Only establishes a DataConnection if no other DataConnection to that peer is open.
   * @param peerId
   * @param options
   */
  async uniqueConnect(
    peerId: string,
    options?: PeerConnectOption,
  ): Promise<DataConnection> {
    return new Promise<DataConnection>(async (resolve, reject) => {
      if (this.peers.has(peerId)) {
        reject(`connection to ${peerId} already exists`);
      }

      resolve(this.asyncConnect(peerId, options));
    });
  }
}

// Peer Test
// TODO write tests for PeerClient
export async function testPeer() {
  const peer = await PeerClient.initialize();
  const peer2 = await PeerClient.initialize();

  const dataConnection = await peer.asyncConnect(peer2.id);
  const data = prompt("Message", "Hi!");

  dataConnection.send(data);
}
