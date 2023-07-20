import app from './app.js';
import dotenv from 'dotenv';
dotenv.config({ path: './src/config.env' });
import mongoose from 'mongoose';

const port = process.env.PORT;

const DBConnection = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!
);

console.log(DBConnection);

mongoose
  .connect(DBConnection)
  .then(() => console.log('DB connection successful'));

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
