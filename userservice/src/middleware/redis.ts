import redis from 'redis'
import c from 'config'

/**
 * Created to use only one instance of the redis Connection
 */
export const redis_connection = await redisConnection()

/**
 * Creates connection to the redis database
 */
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
