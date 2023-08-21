db = new Mongo().getDB("userservice");

db.createCollection("users", { capped: false });

// db.users.insert([
//   { username: 'sandesh', password: '1234', date: '2000-01-01' },
//   { username: 'sandesh', password: '1234', date: '2000-01-01' },
//   { username: 'sandesh', password: '1234', date: '2000-01-01' },
//   { username: 'sandesh', password: '1234', date: '2000-01-01' },
// ]);

db.createUser({
  user: "us_admin",
  pwd: "jFRBDfG-lAz8yXA",
  roles: [
    {
      role: "readWrite",
      db: "userservice",
    },
  ],
});
