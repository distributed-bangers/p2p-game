import BitVector, { BitValue } from './bitVector'
import PeerClient from './peerClient'
import { DataConnection } from 'peerjs'
import { Inputs, PlayerState } from './client'


const peerClient: Promise<void | PeerClient> = PeerClient.initialize().then(peerClient => {
    postMessage(peerClient.id)

    peerClient.on('connection', onConnection)
})

function onConnection(dataConnection: DataConnection) {
    dataConnection.on('data', (data) => {
        onInput(dataConnection.peer, data as BitVector)
    })
}

console.log("Hello from physics engine")

const highestAcknowledgedInput: { [peerId: string]: number } = { 'sus': 5 }
const fps = 60
const numberOfInputs = 5
// input corresponding to the highest frame number is last in inputsBuffer
let inputsBuffer: Inputs[] = []
const playoutBuffer: { [peerId: string]: Inputs }[] = []

let frameNumber = 0
let state: Inputs = { moveDown: false, moveLeft: false, moveRight: false, moveUp: false, shoot: false }


interface AckMessage {
    frameNumber: number
}

function isPlayerState(any: any): any is PlayerState {
    return typeof any === 'object' && any !== null && (any as PlayerState).moveUp !== undefined
}


/**
 * Handles messages from the main thread.
 * @param event
 */
onmessage = (event: MessageEvent<Inputs>) => {
    console.log(event.data)
    if (isPlayerState(event.data)) {
        state = event.data
    }


}

/**
 * Handles event of incoming acknowledge from other peer.
 * @param peerId
 * @param acknowledge the frame number of the most recent received input
 */
function onAcknowledge(peerId: string, acknowledge: BitVector) {
    const acknowledgedFrame = 20
    highestAcknowledgedInput[peerId] = Math.max(highestAcknowledgedInput[peerId], acknowledgedFrame)
    const newInputsBuffer = inputsBuffer.slice(Math.max(...Object.values(highestAcknowledgedInput)))
    inputsBuffer = newInputsBuffer
}

/**
 * Handles event of incoming inputs from other Peer via WebRTC.
 */
function onInput(peerId: string, packet: BitVector) {
    const frameNumber1 = packet.getUint32(0)

    for (let i = 0; i < frameNumber - frameNumber1; i++) {
        deserializeInputs(packet.slice(32 + i * numberOfInputs, 32 + (i + 1) * numberOfInputs))
    }

    //sendAcknowledge(peerId)
}

// 4 byte framenumber (enough for 2 years of frames) + 1 byte no of frames + worst case (1 + number of inputs) * 120 bits
function sendInputs() {
    inputsBuffer.push(state)
    const packet = new BitVector(200)

    packet.setUint32(0, frameNumber)

    let index = 32
    for (let i = inputsBuffer.length - 1; i > -1; i--) {
        for (let j = 0; j < numberOfInputs; j++) {
            if (Object.values(inputsBuffer[i])[j]) {
                packet.setBit(index, 1)
            } else {
                packet.setBit(index, 0)
            }
            index++
        }
    }
    //console.log(packet.toString())

    postMessage(playoutBuffer.shift())
    ++frameNumber
}


function toBoolean(bit: BitValue): boolean {
    return bit === 1
}

function toBit(boolean: boolean): BitValue {
    return boolean ? 1 : 0
}

/**
 * playOutBuffer
 * stores inputs to play out at specific frames
 *
 */


/*function serializeInputs(inputs: Inputs): BitVector {
    for (const value of Object.values(inputs)) {
        inputsBuffer.append()
    }
}*/

function deserializeInputs(bits: BitVector): Inputs {
    return {
        moveDown: toBoolean(bits.getBit(0)),
        moveLeft: toBoolean(bits.getBit(1)),
        moveRight: toBoolean(bits.getBit(2)),
        moveUp: toBoolean(bits.getBit(3)),
        shoot: toBoolean(bits.getBit(4)),
    }
}

function startSimulation() {
    setInterval(sendInputs, 1000 / fps)
}

/**
 * add inputs to list
 * send all inputs in list
 *
 * on data:
 * read sequenceNumber from data
 * respond with frameNumber of most recent inputs received as ack
 *
 * on ack:
 * add ack to map and counter + 1
 * once counter >= no of peers: remove inputs from list
 */