import { writable } from 'svelte/store';

const user = writable({
  authenticated: false,
  jwt: '',
});

export default user;
