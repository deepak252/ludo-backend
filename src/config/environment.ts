import dotenv from 'dotenv'
dotenv.config()

export const {
  NODE_ENV = 'development',
  SERVER_PORT = 5000,
  COOKIE_SECRET = 'SECRET',
  MONGO_URI,
  ACCESS_TOKEN_SECRET = '',
  REFRESH_TOKEN_SECRET = '',
  ACCESS_TOKEN_EXPIRY = '',
  REFRESH_TOKEN_EXPIRY = '',
  CLIENT_URL = ''
} = process.env
