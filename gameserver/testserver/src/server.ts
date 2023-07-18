import app from './app.js';
import dotenv from 'dotenv';
dotenv.config({ path: './src/config.env' });

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
