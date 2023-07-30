import userRoutes from './routes/userRoutes.js'
import { apiURL } from './constants/constants.js'
import express, { urlencoded, json } from 'express'

// //* app.js is mainly for applying middleware
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const app = express()

app.use(json())
app.use(urlencoded({ extended: true }))
app.use(`${apiURL}/users/`, userRoutes)

export default app