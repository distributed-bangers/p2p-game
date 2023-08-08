import express, { urlencoded } from 'express'
import gameRoutes from './routes/gameRoutes.js'
import { apiURL } from './constants/constants.js'
import { createServer } from 'http'
import cors, { CorsOptions } from 'cors'

// //* app.js is mainly for applying middleware
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const clientUrl = process.env.CLIENT_URL

let corsOptions: CorsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
}

const app = express()

app.use(cors(corsOptions))
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(`${apiURL}/games`, gameRoutes)

const httpServer = createServer(app)
export default httpServer
