import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import ngoRoutes from './routes/ngoRoutes.js'
import userRoutes from './routes/userRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import {Server} from 'socket.io'
import http from 'http'

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 5000;
console.log(process.env.MONGO)
// Middleware
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: `${process.env.FRONTEND_URL}`,  
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials:true
}));

const io = new Server(server, {
    cors: {
      origin: `${process.env.FRONTEND_URL}`,
      methods: ["GET", "POST"]
    }
  });


// Connect to MongoDB
mongoose.connect(process.env.MONGO)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

app.use ("/auth",authRoutes)
app.use("/listings",listingRoutes)
app.use("/ngo",ngoRoutes)
app.use("/users",userRoutes)
app.use("/chat",chatRoutes)
app.use("/reviews",reviewRoutes)

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);
  
    // Receive message and broadcast
    socket.on('send_message', (data) => {
      console.log('Message Received:', data);
      socket.to(data.room).emit('receive_message', data);
    });
  
    // Join room
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User with ID ${socket.id} joined room ${room}`);
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected: ' + socket.id);
    });
  });

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
