import mongoose, { Mongoose } from 'mongoose';

const listingSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    category: {type: String, required: true},
    expiryDate: {type: Date, required: true},
    quantity: {type: Number, required: true},
    imgUrl: {type: String, required: true},
    status:{type: String, default: 'active'},
    claimedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'ngo'},
    location:{
        coordinates:
        {
            lat: {type: Number},
            lon: {type: Number}
        },
        city: {type: String},
    }
}, { timestamps: true });

export default mongoose.models.listings || mongoose.model('listings', listingSchema);
