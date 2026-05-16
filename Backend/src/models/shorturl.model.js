import mongoose from "mongoose";


const shortUrlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    clicks: {
        type: Number,
        default: 0
    },
    uniqueClicks: {
        type: Number,
        default: 0
    },
    uniqueVisitors: {
        type: [String],
        default: []
    },
    lastClickedAt: {
        type: Date,
        default: null
    },
    clickEvents: {
        type: [
            new mongoose.Schema({
                clickedAt: {
                    type: Date,
                    default: Date.now
                },
                visitorId: String,
                ip: String,
                country: String,
                region: String,
                city: String,
                referrer: String,
                device: String,
                browser: String
            }, { _id: false })
        ],
        default: []
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});



const urlSchema = mongoose.model('shortUrl', shortUrlSchema);
export default urlSchema;