import 'socket.io'
import { UserDocument } from '../types/user.types.js'

declare module 'socket.io' {
  interface Socket {
    user?: UserDocument
  }
}
