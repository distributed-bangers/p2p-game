db = new Mongo().getDB("gameservice");

db.createCollection("games", { capped: false });

db.createUser({
  user: "gs_admin",
  pwd: "root",
  roles: [
    {
      role: "readWrite",
      db: "gameservice",
    },
  ],
});
