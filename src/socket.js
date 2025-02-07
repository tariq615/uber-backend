import { Server } from "socket.io";
import { userModel } from "./models/user.model.js";
import { captainModel } from "./models/captain.model.js";
import { ApiError } from "./utils/ApiError.js";

let io;

// Initialize the Socket.IO server
export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: process.env.CORS_METHODS?.split(","),
    },
  });

  // Handle client connections
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Listen for the "join" event
    socket.on("join", async (data) => {
      try {
        const { userId, userType } = data;

        if (!userId || !userType) {
          throw new ApiError(
            400,
            "Invalid data. 'userId' and 'userType' are required."
          );
        }

        // Handle userType logic
        if (userType === "user") {
          const user = await userModel.findByIdAndUpdate(userId, {
            socketId: socket.id,
          });
          // console.log(user);

          if (!user) {
            throw new ApiError(404, "User not found.");
          }
        } else {
          const captain = await captainModel.findByIdAndUpdate(userId, {
            socketId: socket.id,
          });
          // console.log(captain);

          if (!captain) {
            throw new ApiError(404, "Captain not found.");
          }
        }
      } catch (error) {
        console.error(`Error in 'join' event: ${error.message}`);
      }
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;
    
      if (!location || !location.ltd || !location.lng) {
        return socket.emit("error", { message: "Invalid location data" });
      }
      console.log(location, "from socket");
      
      const cap = await captainModel.findByIdAndUpdate(userId, {
        location: {
          type: "Point",
          coordinates: [location.lng, location.ltd],
        },
      });
    
      if (!cap) {
        return socket.emit("error", { message: "Captain not found" });
      }
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

export const sendMessageToSocketId = (socketId, messageObject) => {

  console.log(messageObject);
  
      if (io) {
          io.to(socketId).emit(messageObject.event, messageObject.data);
      } else {
          console.log('Socket.io not initialized.');
      }
  }