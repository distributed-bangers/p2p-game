import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
dotenv.config({ path: './src/config.env' });

const DBConnection = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!
);

console.log(DBConnection);

mongoose
  .connect(DBConnection)
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`userservice is listening on port ${port}`);
});
