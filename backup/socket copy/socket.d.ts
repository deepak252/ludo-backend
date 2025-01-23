import 'socket.io'
import { UserDocument } from '../types/user.types'

declare module 'socket.io' {
  interface Socket {
    user?: UserDocument
  }
}
