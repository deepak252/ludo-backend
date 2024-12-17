import { Server } from "socket.io";
import { createServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { RedisClientType, createClient } from "redis";

// Set up Redis clients
const pubClient: RedisClientType = createClient({ url: "redis://localhost:6379" });
const subClient: RedisClientType = pubClient.duplicate();

(async () => {
  try {
    await pubClient.connect();
    await subClient.connect();

    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

// Set up HTTP server
const httpServer = createServer();

// Initialize Socket.IO with Redis adapter
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Set appropriate CORS for production
    methods: ["GET", "POST"],
  },
});

io.adapter(createAdapter(pubClient, subClient));

// Handle connections
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a room
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
    io.to(room).emit("user-joined", socket.id);
  });

  // Leave a room
  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
    io.to(room).emit("user-left", socket.id);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });

(async () => {
  try {
    await redisClient.connect();
    console.log("Redis client connected for room/user storage");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

// Store user in a room
export const addUserToRoom = async (room: string, userId: string) => {
  await redisClient.sAdd(room, userId); // Add user to a room (Redis set)
};

// Remove user from a room
export const removeUserFromRoom = async (room: string, userId: string) => {
  await redisClient.sRem(room, userId); // Remove user from a room
};

// Get users in a room
export const getUsersInRoom = async (room: string): Promise<string[]> => {
  return await redisClient.sMembers(room); // Retrieve all users in a room
};

// Delete room (if needed)
export const deleteRoom = async (room: string) => {
  await redisClient.del(room);
};




import { addUserToRoom, removeUserFromRoom, getUsersInRoom } from "./redisStore";

// When a user joins a room
socket.on("join-room", async (room) => {
  socket.join(room);
  await addUserToRoom(room, socket.id);
  const users = await getUsersInRoom(room);
  io.to(room).emit("room-users", users);
});

// When a user leaves a room
socket.on("leave-room", async (room) => {
  socket.leave(room);
  await removeUserFromRoom(room, socket.id);
  const users = await getUsersInRoom(room);
  io.to(room).emit("room-users", users);
});

// On disconnect
socket.on("disconnect", async () => {
  // Iterate through all rooms to remove user
  const rooms = Array.from(socket.rooms);
  for (const room of rooms) {
    await removeUserFromRoom(room, socket.id);
    const users = await getUsersInRoom(room);
    io.to(room).emit("room-users", users);
  }
});
