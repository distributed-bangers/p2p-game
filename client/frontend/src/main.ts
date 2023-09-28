import { GameClient } from '../../game/src/client';
import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export let gameClient: GameClient;

export async function initializeGameClient(myId: string) {

  gameClient = await GameClient.initialize(myId, {
    host: import.meta.env.VITE_PEER_SERVER_HOST,
    port: import.meta.env.VITE_PEER_SERVER_PORT,
    path: import.meta.env.VITE_PEER_SERVER_PATH,
  });
}

export function disposeGameClient() {
  gameClient = null;
}

export default app
