import 'socket.io'
import { User } from '../types/user.types'

declare module 'socket.io' {
  interface Socket {
    user?: User
  }
}
