import express, { urlencoded } from 'express';
import gameRoutes from './routes/gameRoutes.js';

// //* app.js is mainly for applying middleware
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use('/games', gameRoutes);

export default app;
