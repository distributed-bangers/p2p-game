db.createUser({
  user: 'gameservice',
  pwd: 'gameservice',
  roles: [
    {
      role: 'readWrite',
      db: 'games',
    },
  ],
});

db.createUser({
  user: 'userservice',
  pwd: 'userservice',
  roles: [
    {
      role: 'readWrite',
      db: 'users',
    },
  ],
});

db = new Mongo().getDB('games');
db = new Mongo().getDB('users');
