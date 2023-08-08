import userRoutes from './routes/userRoutes.js'
import { apiURL } from './constants/constants.js'
import express, { urlencoded, json } from 'express'
import cors, { CorsOptions } from 'cors'
import config from 'config'

// //* app.js is mainly for applying middleware
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const clientUrl = <string>config.get('client.url')

let corsOptions: CorsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
}

const app = express()

app.use(cors(corsOptions))
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(`${apiURL}/users/`, userRoutes)

export default app
