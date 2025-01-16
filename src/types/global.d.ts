import { User } from './user.types'

declare module 'express' {
  interface Request {
    session: {
      user?: User
      accessToken?: string
    }
    user?: User
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: User // Add the user property
    accessToken?: string // Add the accessToken property
  }
}
