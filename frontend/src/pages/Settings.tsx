import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface UserSettings {
  email: string;
  username: string;
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  currency: string;
}

const Settings = () => {
  const { token, user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    username: '',
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;
    
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await axios.put('http://localhost:5000/api/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Settings updated successfully');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

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
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Account Settings
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={settings.username}
                    onChange={handleChange('username')}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={settings.email}
                    onChange={handleChange('email')}
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Preferences
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications}
                        onChange={handleChange('notifications')}
                        disabled={saving}
                      />
                    }
                    label="Enable Push Notifications"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailAlerts}
                        onChange={handleChange('emailAlerts')}
                        disabled={saving}
                      />
                    }
                    label="Enable Email Alerts"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={handleChange('darkMode')}
                        disabled={saving}
                      />
                    }
                    label="Dark Mode"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Currency"
                    value={settings.currency}
                    onChange={handleChange('currency')}
                    disabled={saving}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings; 