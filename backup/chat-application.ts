// Project Structure
// correct flow and code with proper file structure for chat application using technologies - 
// nodejs, typescript, socket.io, redis, mongoose
/*
src/
├── config/
│   ├── redis.ts
│   └── mongodb.ts
├── models/
│   ├── User.ts
│   ├── Message.ts
│   └── Room.ts
├── services/
│   ├── socketService.ts
│   ├── messageService.ts
│   └── userService.ts
├── types/
│   └── index.ts
├── middleware/
│   └── auth.ts
├── utils/
│   └── logger.ts
└── server.ts

package.json
tsconfig.json
.env
*/

// src/types/index.ts
interface User {
    _id: string;
    username: string;
    email: string;
    status: 'online' | 'offline';
    lastSeen: Date;
  }
  
  interface Message {
    _id: string;
    sender: string;
    room: string;
    content: string;
    timestamp: Date;
  }
  
  interface Room {
    _id: string;
    name: string;
    participants: string[];
    type: 'private' | 'group';
  }
  
  // src/config/redis.ts
  import Redis from 'ioredis';
  import dotenv from 'dotenv';
  
  dotenv.config();
  
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  });
  
  export default redis;
  
  // src/config/mongodb.ts
  import mongoose from 'mongoose';
  import dotenv from 'dotenv';
  
  dotenv.config();
  
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat');
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  };
  
  export default connectDB;
  
  // src/models/User.ts
  import mongoose, { Schema } from 'mongoose';
  
  const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    lastSeen: { type: Date, default: Date.now },
  });
  
  export default mongoose.model('User', userSchema);
  
  // src/models/Message.ts
  import mongoose, { Schema } from 'mongoose';
  
  const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  });
  
  export default mongoose.model('Message', messageSchema);
  
  // src/models/Room.ts
  import mongoose, { Schema } from 'mongoose';
  
  const roomSchema = new Schema({
    name: { type: String, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['private', 'group'], required: true },
  });
  
  export default mongoose.model('Room', roomSchema);
  
  // src/services/socketService.ts
  import { Server, Socket } from 'socket.io';
  import http from 'http';
  import redis from '../config/redis';
  import { messageService } from './messageService';
  import { userService } from './userService';
  
  export class SocketService {
    private io: Server;
  
    constructor(server: http.Server) {
      this.io = new Server(server, {
        cors: {
          origin: process.env.CLIENT_URL || 'http://localhost:3000',
          methods: ['GET', 'POST'],
        },
      });
  
      this.io.on('connection', this.handleConnection.bind(this));
    }
  
    private async handleConnection(socket: Socket) {
      const userId = socket.handshake.auth.userId;
      
      if (!userId) {
        socket.disconnect();
        return;
      }
  
      // Join user's personal room
      socket.join(userId);
      await userService.updateUserStatus(userId, 'online');
  
      // Handle joining chat rooms
      socket.on('join_room', async (roomId: string) => {
        socket.join(roomId);
        await redis.sadd(`room:${roomId}:users`, userId);
      });
  
      // Handle new messages
      socket.on('send_message', async (data: { roomId: string, content: string }) => {
        const message = await messageService.createMessage({
          sender: userId,
          room: data.roomId,
          content: data.content,
        });
  
        this.io.to(data.roomId).emit('new_message', message);
      });
  
      // Handle disconnection
      socket.on('disconnect', async () => {
        await userService.updateUserStatus(userId, 'offline');
        const rooms = Array.from(socket.rooms);
        rooms.forEach(async (roomId) => {
          await redis.srem(`room:${roomId}:users`, userId);
        });
      });
    }
  
    public broadcastToRoom(roomId: string, event: string, data: any) {
      this.io.to(roomId).emit(event, data);
    }
  }
  
  // src/services/messageService.ts
  import Message from '../models/Message';
  import redis from '../config/redis';
  
  export const messageService = {
    async createMessage(messageData: Partial<Message>) {
      const message = await Message.create(messageData);
      await redis.lpush(`room:${messageData.room}:messages`, JSON.stringify(message));
      return message;
    },
  
    async getMessages(roomId: string, limit: number = 50) {
      const cachedMessages = await redis.lrange(`room:${roomId}:messages`, 0, limit - 1);
      if (cachedMessages.length > 0) {
        return cachedMessages.map(msg => JSON.parse(msg));
      }
  
      const messages = await Message.find({ room: roomId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('sender');
      
      await Promise.all(
        messages.map(msg => 
          redis.lpush(`room:${roomId}:messages`, JSON.stringify(msg))
        )
      );
  
      return messages;
    },
  };
  
  // src/services/userService.ts
  import User from '../models/User';
  import redis from '../config/redis';
  
  export const userService = {
    async updateUserStatus(userId: string, status: 'online' | 'offline') {
      await User.findByIdAndUpdate(userId, {
        status,
        lastSeen: new Date(),
      });
      
      await redis.hset(`user:${userId}`, 'status', status);
    },
  
    async getUserStatus(userId: string) {
      const cachedStatus = await redis.hget(`user:${userId}`, 'status');
      if (cachedStatus) return cachedStatus;
  
      const user = await User.findById(userId);
      if (user) {
        await redis.hset(`user:${userId}`, 'status', user.status);
        return user.status;
      }
      
      return 'offline';
    },
  };
  
  // src/server.ts
  import express from 'express';
  import http from 'http';
  import dotenv from 'dotenv';
  import connectDB from './config/mongodb';
  import { SocketService } from './services/socketService';
  
  dotenv.config();
  
  const app = express();
  const server = http.createServer(app);
  
  // Initialize Socket.IO
  const socketService = new SocketService(server);
  
  // Connect to MongoDB
  connectDB();
  
  // Express middleware
  app.use(express.json());
  
  const PORT = process.env.PORT || 3000;
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // package.json
  {
    "name": "chat-application",
    "version": "1.0.0",
    "main": "dist/server.js",
    "scripts": {
      "start": "node dist/server.js",
      "dev": "nodemon src/server.ts",
      "build": "tsc",
      "lint": "eslint src/**/*.ts",
      "format": "prettier --write src/**/*.ts"
    },
    "dependencies": {
      "express": "^4.18.2",
      "socket.io": "^4.7.2",
      "mongoose": "^8.0.0",
      "ioredis": "^5.3.2",
      "dotenv": "^16.3.1"
    },
    "devDependencies": {
      "@types/express": "^4.17.21",
      "@types/node": "^20.9.0",
      "typescript": "^5.2.2",
      "nodemon": "^3.0.1",
      "ts-node": "^10.9.1"
    }
  }
  
  // tsconfig.json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
  }
  
  // .env
  PORT=3000
  MONGODB_URI=mongodb://localhost:27017/chat
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  CLIENT_URL=http://localhost:3000
  