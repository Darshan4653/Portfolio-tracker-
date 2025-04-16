const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    change: {
        type: Number,
        required: true
    },
    changePercent: {
        type: Number,
        required: true
    },
    dayHigh: {
        type: Number,
        required: true
    },
    dayLow: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique symbols per user
wishlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema); 