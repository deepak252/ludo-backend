import 'socket.io'

declare module 'socket.io' {
  interface Socket {
    user: {
      userId?: string
      email?: string
    }
  }
}
