import { Server } from 'socket.io'
import { connectMatch } from './match/index.js'

export const initSocket = (io: Server) => {
  console.log('Initializing Socket.IO namespaces...')
  connectMatch(io)
}
