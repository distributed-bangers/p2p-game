import redis from 'redis'
import c from 'config'

export const redis_connection = await redisConnection()

async function redisConnection() {
    const redisClient = redis.createClient({
        url: c.get('redis.conn_string'),
    })
    redisClient.on('error', (err) => {
        console.log('Redis Client Error', err)
    })
    redisClient.on('connect', () => {
        console.log('Redis connected!')
    })
    await redisClient.connect()
    return redisClient
}
