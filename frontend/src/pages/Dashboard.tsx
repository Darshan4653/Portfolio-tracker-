import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface PortfolioSummary {
  totalValue: number;
  totalProfit: number;
  profitPercentage: number;
}

interface StockData {
  date: string;
  value: number;
}

const Dashboard = () => {
  const { token } = useAuth();
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalProfit: 0,
    profitPercentage: 0
  });
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('http://localhost:5000/api/portfolio/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPortfolioSummary(response.data || {
          totalValue: 0,
          totalProfit: 0,
          profitPercentage: 0
        });
        
        // Fetch historical data for the chart
        const historicalResponse = await axios.get('http://localhost:5000/api/portfolio/historical', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChartData(historicalResponse.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

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
      <Grid container spacing={3}>
        {/* Portfolio Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Portfolio Value
              </Typography>
              <Typography variant="h4">
                ₹{portfolioSummary.totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Profit/Loss
              </Typography>
              <Typography
                variant="h4"
                color={(portfolioSummary?.totalProfit || 0) >= 0 ? 'success.main' : 'error.main'}
              >
                ₹{portfolioSummary.totalProfit.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Profit Percentage
              </Typography>
              <Typography
                variant="h4"
                color={(portfolioSummary?.profitPercentage || 0) >= 0 ? 'success.main' : 'error.main'}
              >
                {portfolioSummary.profitPercentage.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Performance Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Performance
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name="Portfolio Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 