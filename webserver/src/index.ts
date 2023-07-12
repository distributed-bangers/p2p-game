import express from 'express';

// //* app.js is mainly for applying middleware
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const app = express();

app.use(express.json());

export default app;
