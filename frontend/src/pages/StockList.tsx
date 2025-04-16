import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box,
  IconButton,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockList = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:5000/api/stocks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setError('Failed to load stocks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPortfolio = async (symbol: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        'http://localhost:5000/api/portfolio/add',
        { symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh stocks after adding to portfolio
      fetchStocks();
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
      setError('Failed to add stock to portfolio. Please try again.');
    }
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Available Stocks
          </Typography>
          <TextField
            label="Search stocks"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Change</TableCell>
                <TableCell align="right">Change %</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStocks.map((stock) => (
                <TableRow key={stock.symbol}>
                  <TableCell component="th" scope="row">
                    {stock.symbol}
                  </TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell align="right">${stock.price.toFixed(2)}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: stock.change >= 0 ? 'success.main' : 'error.main' }}
                  >
                    ${stock.change.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: stock.changePercent >= 0 ? 'success.main' : 'error.main' }}
                  >
                    {stock.changePercent.toFixed(2)}%
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleAddToPortfolio(stock.symbol)}
                    >
                      <AddIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default StockList; 