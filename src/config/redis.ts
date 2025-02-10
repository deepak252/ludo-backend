import { Redis } from 'ioredis'
import { RedisStore } from 'connect-redis'
import { REDIS_PASSWORD, REDIS_PORT, REDIS_URI } from './environment'

const redisClient = new Redis({
  host: REDIS_URI,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD
})

const pubClient = new Redis({
  host: REDIS_URI,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD
})
const subClient = pubClient.duplicate()

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'myapp:'
})

redisClient.on('connect', () => {
  console.log('Connected to Redis!')
})

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err)
})

redisClient.on('close', () => {
  console.error('Redis connection closed')
})

export { redisClient, pubClient, subClient, redisStore }
