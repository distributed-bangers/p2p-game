import express, { urlencoded } from 'express';
import gameRoutes from './routes/gameRoutes.js';
import { apiURL } from './constants/constants.js';

// //* app.js is mainly for applying middleware
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(`${apiURL}/games`, gameRoutes);

export default app;
