import http from "http";
import { app } from "./app.js";
import { initializeSocket } from "./socket.js";

const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Initialize Socket.IO
initializeSocket(server);

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
