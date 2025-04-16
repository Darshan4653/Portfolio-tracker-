const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Get all stocks
router.get('/', auth, async (req, res) => {
  try {
    // In a real application, you would fetch this from a stock API
    // For demo purposes, we'll return mock data
    const stocks = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.25,
        change: 2.50,
        changePercent: 1.67,
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 2750.75,
        change: -15.25,
        changePercent: -0.55,
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 285.50,
        change: 5.75,
        changePercent: 2.06,
      },
      // Add more mock stocks as needed
    ];
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get stock details by symbol
router.get('/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    // In a real application, you would fetch this from a stock API
    // For demo purposes, we'll return mock data
    const stock = {
      symbol,
      name: 'Sample Stock',
      price: 100.00,
      change: 2.50,
      changePercent: 2.50,
      volume: 1000000,
      marketCap: 1000000000,
    };
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 