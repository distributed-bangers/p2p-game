db = new Mongo().getDB("userservice");

db.createCollection("users", { capped: false });

db.users.insert([
  {
    _id: '6516c437de09212b862b6165',
    username: 'User1',
    salt: '98b48859-8e2b-46fa-8fc7-f800c77b50bb',
    password: '2137db5d61733d18511a43cd5ff454f13d1e6000c6096a413c0f2b9e945a562c',
    createdDate: '2023-09-29T12:33:59.857Z'
  },
  {
    _id: '6516c437de09212b862b6166',
    username: 'User2',
    salt: '98b48859-8e2b-46fa-8fc7-f800c77b50bb',
    password: '2137db5d61733d18511a43cd5ff454f13d1e6000c6096a413c0f2b9e945a562c',
    createdDate: '2023-09-29T12:33:59.857Z'
  },
]);
// username: User1, password: User1!User1!
// username: User2, password: User1!User1!

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
