import mongoose from 'mongoose';
import app from './app.js';
import config from 'config';

const DBConnection = <string>config.get('mongo.conn_string');
const port = <number>config.get('server.port');

mongoose
  .connect(DBConnection)
  .then(() => console.log('DB connection successful'));

app.listen(port, () => {
  console.log(`userservice is listening on port :${port}`);
});
