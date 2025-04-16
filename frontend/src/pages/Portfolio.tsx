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
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<PortfolioItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (symbol: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/portfolio/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPortfolio();
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  const handleEdit = (stock: PortfolioItem) => {
    setSelectedStock(stock);
    setEditQuantity(stock.quantity.toString());
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedStock) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/portfolio/${selectedStock.symbol}`,
        { quantity: parseInt(editQuantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      fetchPortfolio();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Portfolio
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Purchase Price</TableCell>
                <TableCell align="right">Current Price</TableCell>
                <TableCell align="right">Total Value</TableCell>
                <TableCell align="right">Profit/Loss</TableCell>
                <TableCell align="right">Profit/Loss %</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.map((item) => (
                <TableRow key={item.symbol}>
                  <TableCell component="th" scope="row">
                    {item.symbol}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.purchasePrice.toFixed(2)}</TableCell>
                  <TableCell align="right">${item.currentPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">${item.totalValue.toFixed(2)}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: item.profitLoss >= 0 ? 'success.main' : 'error.main' }}
                  >
                    ${item.profitLoss.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: item.profitLossPercentage >= 0 ? 'success.main' : 'error.main' }}
                  >
                    {item.profitLossPercentage.toFixed(2)}%
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(item)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(item.symbol)}
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

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Stock Quantity</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Portfolio; 