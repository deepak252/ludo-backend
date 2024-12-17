import { Redis } from 'ioredis'

const redis = new Redis({
  host: 'redis', // Docker service name
  port: 6379
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

export { redis }
