const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getCurrentPrice, getHistoricalData } = require('../utils/nseApi');

// Get user's portfolio
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const portfolio = await Promise.all(
            user.portfolio.map(async (item) => {
                try {
                    const stockData = await getCurrentPrice(item.symbol);
                    return {
                        symbol: item.symbol,
                        name: stockData.companyName || item.symbol,
                        name: stockData.name,
                        quantity: item.quantity,
                        purchasePrice: item.purchasePrice,
                        currentPrice: stockData.currentPrice,
                        totalValue: item.quantity * stockData.currentPrice,
                        profitLoss: item.quantity * (stockData.currentPrice - item.purchasePrice),
                        profitLossPercentage: ((stockData.currentPrice - item.purchasePrice) / item.purchasePrice) * 100,
                        dayHigh: stockData.dayHigh,
                        dayLow: stockData.dayLow,
                        volume: stockData.volume
                    };
                } catch (error) {
                    console.error(`Error fetching data for ${item.symbol}:`, error);
                    return null;
                }
            })
        );

        res.json(portfolio.filter(item => item !== null));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add stock to portfolio
router.post('/add', auth, async (req, res) => {
  try {
    const { symbol, quantity = 1 } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a real application, you would fetch current price from a stock API
    const currentPrice = 100.00; // Mock current price

    // Check if stock already exists in portfolio
    const existingStock = user.portfolio.find(item => item.symbol === symbol);
    if (existingStock) {
      existingStock.quantity += quantity;
    } else {
      user.portfolio.push({
        symbol,
        quantity,
        purchasePrice: currentPrice,
        purchaseDate: new Date(),
      });
    }

    await user.save();
    res.json({ message: 'Stock added to portfolio' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update stock quantity in portfolio
router.put('/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { quantity } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stock = user.portfolio.find(item => item.symbol === symbol);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found in portfolio' });
    }

    stock.quantity = quantity;
    await user.save();
    res.json({ message: 'Portfolio updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove stock from portfolio
router.delete('/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.portfolio = user.portfolio.filter(item => item.symbol !== symbol);
    await user.save();
    res.json({ message: 'Stock removed from portfolio' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get portfolio summary
router.get('/summary', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let totalValue = 0;
        let totalCost = 0;

        for (const stock of user.portfolio) {
            try {
                const stockData = await getCurrentPrice(stock.symbol);
                totalValue += stockData.currentPrice * stock.quantity;
                totalCost += stock.purchasePrice * stock.quantity;
            } catch (error) {
                console.error(`Error fetching price for ${stock.symbol}:`, error);
            }
        }

        const totalProfit = totalValue - totalCost;
        const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

        res.json({
            totalValue,
            totalProfit,
            profitPercentage
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get historical portfolio data
router.get('/historical', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get last 30 days of data
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);

        const historicalData = await Promise.all(
            user.portfolio.map(async (stock) => {
                try {
                    const data = await getHistoricalData(
                        stock.symbol,
                        fromDate.toISOString().split('T')[0],
                        toDate.toISOString().split('T')[0]
                    );
                    return data;
                } catch (error) {
                    console.error(`Error fetching historical data for ${stock.symbol}:`, error);
                    return null;
                }
            })
        );

        // Process and combine historical data
        const combinedData = processHistoricalData(historicalData, user.portfolio);
        res.json(combinedData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add stock to portfolio
router.post('/stocks', auth, async (req, res) => {
    try {
        const { symbol, quantity, purchasePrice, purchaseDate } = req.body;
        
        // Verify stock exists and get current price
        const stockData = await getCurrentPrice(symbol);

        const user = await User.findById(req.user.userId);
        user.portfolio.push({
            symbol,
            quantity,
            purchasePrice: purchasePrice || stockData.currentPrice,
            purchaseDate: purchaseDate || new Date()
        });

        await user.save();
        res.status(201).json(user.portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove stock from portfolio
router.delete('/stocks/:symbol', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.portfolio = user.portfolio.filter(stock => stock.symbol !== req.params.symbol);
        await user.save();
        res.json(user.portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Helper function to process historical data
function processHistoricalData(historicalData, portfolio) {
    // Combine historical data from all stocks
    const combinedData = [];
    const dateMap = new Map();

    historicalData.forEach((data, index) => {
        if (!data) return;

        data.forEach(day => {
            const date = day.date;
            if (!dateMap.has(date)) {
                dateMap.set(date, {
                    date,
                    value: 0
                });
            }
            const portfolioItem = portfolio[index];
            dateMap.get(date).value += day.close * portfolioItem.quantity;
        });
    });

    return Array.from(dateMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

module.exports = router; 