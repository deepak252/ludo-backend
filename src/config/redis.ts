import { Redis } from 'ioredis'
import { RedisStore } from 'connect-redis'

const redisClient = new Redis({
  host: 'redis', // Docker service name
  port: 6379
})

const pubClient = new Redis({
  host: 'redis', // Docker service name
  port: 6379
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
