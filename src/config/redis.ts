import { Redis } from 'ioredis'
import { RedisStore } from 'connect-redis'

const redis = new Redis({
  host: 'redis', // Docker service name
  port: 6379
})

const pubClient = new Redis({
  host: 'redis', // Docker service name
  port: 6379
})
const subClient = pubClient.duplicate()

const redisStore = new RedisStore({
  client: redis,
  prefix: 'myapp:'
})

redis.on('connect', () => {
  console.log('Connected to Redis!')
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

redis.on('close', () => {
  console.error('Redis connection closed')
})

export { redis, pubClient, subClient, redisStore }
