import { Server } from "socket.io";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);

    let leaderboard = [];
    let chatHistory = [];

    io.on("connection", (socket) => {
      console.log("New client connected");

      // Send current leaderboard and chat history to new client
      socket.emit("leaderboardUpdate", leaderboard);
      socket.emit("chatHistory", chatHistory);

      // Handle chat messages
      socket.on("chatMessage", (msg) => {
        const chatEntry = { user: socket.id, message: msg };
        chatHistory.push(chatEntry);
        if (chatHistory.length > 100) chatHistory.shift(); // Limit chat history to 100 messages
        io.emit("chatMessage", chatEntry);
      });

      // Handle leaderboard updates
      socket.on("updateLeaderboard", (data) => {
        leaderboard.push(data);
        leaderboard = leaderboard
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Keep top 10
        io.emit("leaderboardUpdate", leaderboard);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("Socket is already running");
  }
  res.end();
};

export default ioHandler;
