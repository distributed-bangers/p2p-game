import { GameClient } from './client'

const canvas = document.getElementById('canvas') as HTMLCanvasElement

const gameClient = await GameClient.initialize()

gameClient.renderer.initialize(canvas, window.innerWidth, window.innerHeight)

const otherId: string | null = prompt('Other peer id')
const users = otherId === null ? [] : [otherId]

await gameClient.startGame('test', users)
