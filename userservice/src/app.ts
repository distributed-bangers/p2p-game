import userRoutes from './routes/userRoutes.js'
import { apiURL } from './constants/constants.js'
import express, { urlencoded, json } from 'express'
import cors, { CorsOptions } from 'cors'
import config from 'config'
import swaggerUi from 'swagger-ui-express'
import swaggerFile from './swagger.json' assert { type: 'json' }

const clientUrl = <string>config.get('client.url')

let corsOptions: CorsOptions = {
    origin: clientUrl,
    optionsSuccessStatus: 200,
}

/**
 * Initialisation of Express app and configured accordingly
 */
const app = express()

app.use(cors(corsOptions))
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(`${apiURL}/users/`, userRoutes)

app.use(`${apiURL}/users/docs`, swaggerUi.serve, swaggerUi.setup(swaggerFile))

export default app
