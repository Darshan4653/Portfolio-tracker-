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

interface WishlistItem {
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
      <DialogTitle>Add Stock to Wishlist</DialogTitle>
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

const Wishlist = () => {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      
      // Process and validate the wishlist data
      const processedWishlist = response.data.map((item: any) => {
        // Ensure all required fields are present with default values
        const processedItem = {
          symbol: item.symbol || '',
          name: item.name || 'Unknown Company',
          currentPrice: Number(item.currentPrice) || 0,
          change: Number(item.change) || 0,
          changePercent: Number(item.changePercent) || 0,
          dayHigh: Number(item.dayHigh) || 0,
          dayLow: Number(item.dayLow) || 0,
          volume: Number(item.volume) || 0
        };

        // Validate the processed item
        if (!processedItem.symbol) {
          console.warn('Invalid stock data received:', item);
        }

        return processedItem;
      });
      
      setWishlist(processedWishlist);
    } catch (err: any) {
      console.error('Error fetching wishlist:', err);
      setError(err.response?.data?.message || 'Failed to load wishlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (symbol: string) => {
    try {
      setError(null); // Clear any previous errors
      await axios.post('http://localhost:5000/api/wishlist', 
        { symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchWishlist(); // Refresh the wishlist after adding
    } catch (err: any) {
      console.error('Error adding stock:', err);
      throw new Error(err.response?.data?.message || 'Failed to add stock. Please try again.');
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    try {
      setError(null); // Clear any previous errors
      await axios.delete(`http://localhost:5000/api/wishlist/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchWishlist(); // Refresh the wishlist after removing
    } catch (err: any) {
      console.error('Error removing stock:', err);
      setError(err.response?.data?.message || 'Failed to remove stock from wishlist');
    }
  };

  const filteredWishlist = wishlist.filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                My Wishlist
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
              label="Search wishlist"
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
                  {filteredWishlist.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell>{item.symbol}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">₹{(item.currentPrice || 0).toFixed(2)}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: (item.change || 0) >= 0 ? 'success.main' : 'error.main' }}
                      >
                        ₹{(item.change || 0).toFixed(2)}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: (item.changePercent || 0) >= 0 ? 'success.main' : 'error.main' }}
                      >
                        {(item.changePercent || 0).toFixed(2)}%
                      </TableCell>
                      <TableCell align="right">₹{(item.dayHigh || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{(item.dayLow || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">{(item.volume || 0).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveStock(item.symbol)}
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

export default Wishlist; 