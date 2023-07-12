import express from "express";
import userRoutes from "./routes/userRoutes";

// //* app.js is mainly for applying middleware
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const app = express();

app.use(express.json());
app.use('/user',userRoutes)

export default app;
