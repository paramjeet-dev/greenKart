import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    ngo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }

}, { timestamps: true });

export default mongoose.model('rooms', roomSchema);
