db = new Mongo().getDB('userservice');

db.createCollection('users', { capped: false });

// db.users.insert([
//   { username: 'sandesh', password: '1234', date: '2000-01-01' },
//   { username: 'sandesh', password: '1234', date: '2000-01-01' },
//   { username: 'sandesh', password: '1234', date: '2000-01-01' },
//   { username: 'sandesh', password: '1234', date: '2000-01-01' },
// ]);

db.createUser({
  user: 'us_admin',
  pwd: 'root',
  roles: [
    {
      role: 'readWrite',
      db: 'userservice',
    },
  ],
});

db = new Mongo().getDB('gameservice');

db.createCollection('games', { capped: false });

db.createUser({
  user: 'gs_admin',
  pwd: 'root',
  roles: [
    {
      role: 'readWrite',
      db: 'gameservice',
    },
  ],
});
