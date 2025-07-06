import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: 'user' },
    address: {
        coordinates:
        {
            lat: { type: Number },
            lon: { type: Number }
        },
        city: { type: String },
        pincode: { type: String },
        state: { type: String }
    },
    status:{type:String, default:'active'},
}, { timestamps: true });

export default mongoose.model('users', userSchema);
