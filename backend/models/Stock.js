const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    dayHigh: Number,
    dayLow: Number,
    volume: Number,
    marketCap: Number,
    pe_ratio: Number,
    dividend_yield: Number,
    sector: String,
    priceHistory: [{
        date: Date,
        price: Number,
        volume: Number
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Stock', stockSchema); 