declare namespace Express {
  export interface Request {
    session: {
      user?: {
        username: string
      }
    }
  }
}
