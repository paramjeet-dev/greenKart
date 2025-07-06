import mongoose, { Mongoose } from 'mongoose';

const ngoSchema = new mongoose.Schema({
    registrationId: { type: mongoose.Schema.ObjectId,
        ref:"User"
     },
    name: { type: String, required: true },
    status: { type: String, default: 'pending' },
    documents: {type: Array, default: []},
}, { timestamps: true });

export default mongoose.model('ngo', ngoSchema);
