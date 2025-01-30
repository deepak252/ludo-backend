import session from 'express-session'
import { COOKIE_SECRET, NODE_ENV } from '../config/environment.js'
// import { redisStore } from '../config/redis.js'

export const sessionMiddleware = session({
  secret: COOKIE_SECRET,
  name: 'sid',
  // store: redisStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
})
