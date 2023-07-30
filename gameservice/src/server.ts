import server from './socketios.js'
import dotenv from 'dotenv'
dotenv.config({ path: './src/config.env' })
import mongoose from 'mongoose'

const port = process.env.PORT

const DBConnection = process.env.DATABASE!.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD!
)

console.log(DBConnection)

mongoose
    .connect(DBConnection)
    .then(() => console.log('DB connection successful'))

server.listen(port, () => {
    console.log(`gameservice is listening on port ${port}`)
})
