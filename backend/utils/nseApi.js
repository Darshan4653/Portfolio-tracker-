const axios = require('axios');

// NSE API base URL
const NSE_BASE_URL = 'https://api.nseindia.com';

// Create axios instance with default config
const nseApi = axios.create({
    baseURL: NSE_BASE_URL,
    headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.nseindia.com/',
    }
});

// Function to get current stock price
const getCurrentPrice = async (symbol) => {
    try {
        const response = await nseApi.get(`/api/quote-equity?symbol=${symbol}`);
        return {
            symbol: response.data.symbol,
            name: response.data.companyName,
            currentPrice: response.data.priceInfo.lastPrice,
            change: response.data.priceInfo.change,
            changePercent: response.data.priceInfo.pChange,
            dayHigh: response.data.priceInfo.dayHigh,
            dayLow: response.data.priceInfo.dayLow,
            volume: response.data.marketDeptOrderBook.totalBuyQuantity
        };
    } catch (error) {
        console.error(`Error fetching current price for ${symbol}:`, error);
        throw error;
    }
};

// Function to get historical data
const getHistoricalData = async (symbol, fromDate, toDate) => {
    try {
        const response = await nseApi.get(`/api/historical/cm/equity`, {
            params: {
                symbol,
                from: fromDate,
                to: toDate
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
    }
};

// Function to search stocks
const searchStocks = async (query) => {
    try {
        const response = await nseApi.get(`/api/search/autocomplete?q=${query}`);
        return response.data;
    } catch (error) {
        console.error('Error searching stocks:', error);
        throw error;
    }
};

module.exports = {
    getCurrentPrice,
    getHistoricalData,
    searchStocks
}; 