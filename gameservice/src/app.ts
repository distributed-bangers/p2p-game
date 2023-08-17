import express, { urlencoded } from 'express'
import gameRoutes from './routes/gameRoutes.js'
import { apiURL } from './constants/constants.js'
import { createServer } from 'http'
import cors, { CorsOptions } from 'cors'
import config from 'config'

const clientUrl = <string>config.get('client.url')

let corsOptions: CorsOptions = {
    origin: clientUrl,
    optionsSuccessStatus: 200,
}

const app = express()

app.use(cors(corsOptions))
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(`${apiURL}/games`, gameRoutes)

const httpServer = createServer(app)
export default httpServer
