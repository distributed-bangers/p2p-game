import { writable } from 'svelte/store';

const user = writable({
  userid: '',
  username: '',
  authenticated: false,
  jwt: '',
  game: null,
});

export default user;
