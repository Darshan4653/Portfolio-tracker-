const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const { getCurrentPrice } = require('../utils/nseApi');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Wishlist routes are working' });
});

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.user.id });
    
    // Fetch current prices for all stocks
    const updatedWishlist = await Promise.all(
      wishlist.map(async (item) => {
        try {
          const stockData = await getCurrentPrice(item.symbol);
          return {
            symbol: item.symbol,
            name: stockData.companyName || item.symbol,
            currentPrice: Number(stockData.lastPrice) || 0,
            change: Number(stockData.change) || 0,
            changePercent: Number(stockData.pChange) || 0,
            dayHigh: Number(stockData.dayHigh) || 0,
            dayLow: Number(stockData.dayLow) || 0,
            volume: Number(stockData.totalTradedVolume) || 0
          };
        } catch (err) {
          console.error(`Error fetching data for ${item.symbol}:`, err);
          return null;
        }
      })
    );

    // Filter out any failed fetches
    const validWishlist = updatedWishlist.filter(item => item !== null);
    
    res.json(validWishlist);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add stock to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { symbol } = req.body;
    
    // Check if stock already exists in wishlist
    const existingStock = await Wishlist.findOne({ 
      userId: req.user.id, 
      symbol: symbol.toUpperCase() 
    });
    
    if (existingStock) {
      return res.status(400).json({ message: 'Stock already in wishlist' });
    }

    // Fetch current stock data
    const stockData = await getCurrentPrice(symbol);
    
    // Create new wishlist item
    const newStock = new Wishlist({
      userId: req.user.id,
      symbol: symbol.toUpperCase(),
      name: stockData.companyName || symbol,
      currentPrice: Number(stockData.lastPrice) || 0,
      change: Number(stockData.change) || 0,
      changePercent: Number(stockData.pChange) || 0,
      dayHigh: Number(stockData.dayHigh) || 0,
      dayLow: Number(stockData.dayLow) || 0,
      volume: Number(stockData.totalTradedVolume) || 0
    });

    await newStock.save();
    res.status(201).json(newStock);
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove stock from wishlist
router.delete('/:symbol', auth, async (req, res) => {
  try {
    const stock = await Wishlist.findOneAndDelete({
      userId: req.user.id,
      symbol: req.params.symbol.toUpperCase()
    });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found in wishlist' });
    }

    res.json({ message: 'Stock removed from wishlist' });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 