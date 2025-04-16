import { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    features: [
      'Basic portfolio tracking',
      'Real-time stock prices',
      'Basic analytics',
      'Email notifications',
      'Portfolio alerts'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    features: [
      'Advanced portfolio tracking',
      'Real-time stock prices',
      'Advanced analytics',
      'Priority email support',
      'Portfolio alerts',
      'Technical analysis tools',
      'Market research reports',
      'API access'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2999,
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'Team collaboration',
      'Advanced reporting',
      'Priority API access',
      'Training sessions',
      'SLA guarantee'
    ]
  }
];

const Payment = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(
        'http://localhost:5000/api/payments/subscribe',
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Handle the payment response (e.g., redirect to payment gateway)
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }

      setSuccess('Subscription initiated successfully');
    } catch (err) {
      console.error('Error subscribing:', err);
      setError('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center" gutterBottom>
            Choose Your Plan
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
            Select the plan that best fits your needs
          </Typography>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Grid>
        )}

        {success && (
          <Grid item xs={12}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          </Grid>
        )}

        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                ...(plan.popular && {
                  border: '2px solid',
                  borderColor: 'primary.main',
                  transform: 'scale(1.05)',
                  zIndex: 1
                })
              }}
            >
              {plan.popular && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  Most Popular
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ₹{plan.price}
                  <Typography component="span" variant="subtitle1" color="text.secondary">
                    /month
                  </Typography>
                </Typography>

                <List>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant={plan.popular ? "contained" : "outlined"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Subscribe Now'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Payment; 