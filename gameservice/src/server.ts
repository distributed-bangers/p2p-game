import server from './socketios.js'
import mongoose from 'mongoose'
import config from 'config'

const port = <string>config.get('server.port')

const DBConnection = <string>config.get('mongo.conn_string')

console.log(DBConnection)

mongoose
    .connect(DBConnection)
    .then(() => console.log('DB connection successful'))

server.listen(port, () => {
    console.log(`gameservice is listening on port ${port}`)
})
