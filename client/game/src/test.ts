import { GameClient } from "./client";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const gameClient = await GameClient.initialize();

const otherId: string | null = prompt('Other peer id')

const users = otherId === null ? [] : [otherId]
await gameClient.startGame('test', [])

console.log(gameClient.renderer)

gameClient.renderer?.setCanvas(canvas, window.innerWidth, window.innerHeight)
await gameClient.startGame("test", users);
