import { writable } from 'svelte/store';

const user = writable({
  authenticated: false,
  jwt: '',
  game: null,
});

export default user;
