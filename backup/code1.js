// src/config/redisConfig.ts
import Redis from 'ioredis';

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  enableAutoPipelining: true,
  maxRetriesPerRequest: 3,
  reconnectOnError: (err) => {
    console.error('Redis reconnection error:', err);
    return true;
  }
});

export const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

// src/services/RoomService.ts
import { redisClient } from '../config/redisConfig';

interface UserData {
  id: string;
  username: string;
  socketId: string;
}

interface RoomData {
  users: Record<string, UserData>;
  createdAt: number;
}

export class RoomService {
  private static ROOM_PREFIX = 'room:';
  private static USER_PREFIX = 'room:users:';

  // Add a user to a room
  static async addUserToRoom(roomId: string, user: UserData): Promise<void> {
    const roomKey = `${this.ROOM_PREFIX}${roomId}`;
    const userKey = `${this.USER_PREFIX}${roomId}`;

    // Use multi-step transaction to ensure atomicity
    const multi = redisClient.multi();
    
    // Store room if not exists
    multi.hsetnx(roomKey, 'createdAt', Date.now().toString());
    
    // Add user to room's user set
    multi.hset(userKey, user.id, JSON.stringify(user));

    await multi.exec();
  }

  // Remove user from room
  static async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    const userKey = `${this.USER_PREFIX}${roomId}`;
    await redisClient.hdel(userKey, userId);
  }

  // Get all users in a room
  static async getRoomUsers(roomId: string): Promise<UserData[]> {
    const userKey = `${this.USER_PREFIX}${roomId}`;
    const users = await redisClient.hgetall(userKey);
    
    return Object.values(users).map(userJson => 
      JSON.parse(userJson) as UserData
    );
  }

  // Check if room exists
  static async roomExists(roomId: string): Promise<boolean> {
    const roomKey = `${this.ROOM_PREFIX}${roomId}`;
    return await redisClient.exists(roomKey) === 1;
  }

  // Clean up empty rooms
  static async cleanupEmptyRooms(): Promise<void> {
    const keys = await redisClient.keys(`${this.USER_PREFIX}*`);
    
    for (const key of keys) {
      const userCount = await redisClient.hlen(key);
      if (userCount === 0) {
        // Remove room if no users
        const roomId = key.replace(this.USER_PREFIX, '');
        await redisClient.del(key);
        await redisClient.del(`${this.ROOM_PREFIX}${roomId}`);
      }
    }
  }
}

// src/socket/socketServer.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisClient, redisSubscriber } from '../config/redisConfig';
import { RoomService } from '../services/RoomService';

export function setupSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  // Use Redis adapter for multi-server scaling
  io.adapter(createAdapter(redisClient, redisSubscriber));

  io.on('connection', (socket) => {
    socket.on('join_room', async (roomId: string, userData) => {
      // Add user to room in Redis
      await RoomService.addUserToRoom(roomId, {
        id: userData.id,
        username: userData.username,
        socketId: socket.id
      });

      // Join the socket room
      socket.join(roomId);

      // Broadcast to other users in the room
      socket.to(roomId).emit('user_joined', userData);
    });

    socket.on('leave_room', async (roomId: string, userId: string) => {
      // Remove user from room in Redis
      await RoomService.removeUserFromRoom(roomId, userId);

      // Leave the socket room
      socket.leave(roomId);

      // Broadcast to other users
      socket.to(roomId).emit('user_left', userId);
    });

    socket.on('disconnect', async () => {
      // Find and remove user from all rooms
      // This would require tracking which rooms the user was in
      // You might want to implement additional logic here
    });
  });

  // Periodic cleanup of empty rooms
  setInterval(() => {
    RoomService.cleanupEmptyRooms();
  }, 1000 * 60 * 60); // Every hour

  return io;
}

// src/index.ts (example server setup)
import express from 'express';
import http from 'http';
import { setupSocketServer } from './socket/socketServer';
import { redisClient } from './config/redisConfig';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Setup socket server with Redis persistence
  const io = setupSocketServer(httpServer);

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await httpServer.close();
    await redisClient.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();