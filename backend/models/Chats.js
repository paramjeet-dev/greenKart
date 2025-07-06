import mongoose, { Mongoose } from 'mongoose';

const chatSchema = new mongoose.Schema({
    room: String,
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    message: String,
    time: String,
    lastMessage: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('chats', chatSchema);
