
////current

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");  // Added postRoutes here
const Message = require("./models/Message");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173","http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // serve uploaded files

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);  // Added postRoutes here

// Socket.io Setup
let onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("userJoined", (userId) => {
        if (userId) {
            onlineUsers.set(userId, socket.id);
            io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
            console.log(`User ${userId} connected with socket ID ${socket.id}`);
        }
    });

    socket.on("sendMessage", async (data) => {
        const { senderId, recipientId, text, file } = data;

        const messageData = {
            message: {
                text: text || "",
                file: file || null,
            },
            users: [senderId, recipientId],
            sender: senderId,
        };

        const newMessage = await Message.create(messageData);

        io.to(onlineUsers.get(recipientId)).emit("receiveMessage", {
            ...messageData,
            createdAt: newMessage.createdAt,
        });
        io.to(onlineUsers.get(senderId)).emit("receiveMessage", {
            ...messageData,
            createdAt: newMessage.createdAt,
        });
    });

    socket.on("disconnect", () => {
        onlineUsers.forEach((socketId, userId) => {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                console.log(`User ${userId} disconnected.`);
            }
        });
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
        console.log("User disconnected:", socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
