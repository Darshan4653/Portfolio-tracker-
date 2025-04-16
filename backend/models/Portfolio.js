const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    holdings: [{
        stock: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock'
        },
        quantity: {
            type: Number,
            required: true
        },
        averagePrice: {
            type: Number,
            required: true
        },
        transactions: [{
            type: String,
            price: Number,
            quantity: Number,
            date: Date
        }]
    }],
    totalValue: {
        type: Number,
        default: 0
    },
    profitLoss: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema); 