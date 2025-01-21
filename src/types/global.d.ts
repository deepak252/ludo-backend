import { UserDocument } from './user.types'

declare module 'express' {
  interface Request {
    session: {
      // user?: User
      accessToken?: string
    }
    user?: UserDocument
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: UserDocument // Add the user property
    accessToken?: string // Add the accessToken property
  }
}
