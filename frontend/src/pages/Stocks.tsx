import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
}

interface AddStockDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (symbol: string) => void;
}

const AddStockDialog = ({ open, onClose, onAdd }: AddStockDialogProps) => {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await onAdd(symbol);
      setSymbol('');
      setError('');
      onClose();
    } catch (err) {
      setError('Failed to add stock. Please check the symbol and try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Stock to Portfolio</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Stock Symbol"
          fullWidth
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          error={!!error}
          helperText={error || 'Enter NSE symbol (e.g., RELIANCE, TCS, INFY)'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Stocks = () => {
  const { token } = useAuth();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process and validate the stock data
      const processedStocks = response.data.map((stock: any) => ({
        symbol: stock.symbol || '',
        name: stock.name || 'Unknown Company',
        currentPrice: Number(stock.currentPrice) || 0,
        change: Number(stock.change) || 0,
        changePercent: Number(stock.changePercent) || 0,
        dayHigh: Number(stock.dayHigh) || 0,
        dayLow: Number(stock.dayLow) || 0,
        volume: Number(stock.volume) || 0
      }));
      
      setStocks(processedStocks);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (symbol: string) => {
    try {
      await axios.post('http://localhost:5000/api/portfolio/stocks', 
        { symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStocks();
    } catch (err) {
      throw err;
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/portfolio/stocks/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStocks();
    } catch (err) {
      console.error('Error removing stock:', err);
      setError('Failed to remove stock');
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                My Stocks
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Stock
              </Button>
            </Box>

            <TextField
              fullWidth
              label="Search stocks"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
            />

            {error && (
              <Typography color="error" align="center" gutterBottom>
                {error}
              </Typography>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Company Name</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right">Change %</TableCell>
                    <TableCell align="right">Day High</TableCell>
                    <TableCell align="right">Day Low</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell>{stock.symbol}</TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell align="right">₹{(stock.currentPrice || 0).toFixed(2)}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: (stock.change || 0) >= 0 ? 'success.main' : 'error.main' }}
                      >
                        ₹{(stock.change || 0).toFixed(2)}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: (stock.changePercent || 0) >= 0 ? 'success.main' : 'error.main' }}
                      >
                        {(stock.changePercent || 0).toFixed(2)}%
                      </TableCell>
                      <TableCell align="right">₹{(stock.dayHigh || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{(stock.dayLow || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">{(stock.volume || 0).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveStock(stock.symbol)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <AddStockDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddStock}
      />
    </Container>
  );
};

export default Stocks; 