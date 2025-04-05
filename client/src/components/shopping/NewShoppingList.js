import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Alert from '@mui/material/Alert';
import DatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import AlertContext from '../../context/alert/alertContext';

const NewShoppingList = () => {
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [shoppingList, setShoppingList] = useState({
    name: '',
    description: '',
    primarySupermarket: '',
    plannedPurchaseDate: null
  });
  
  // Load supermarkets
  useEffect(() => {
    const getSupermarkets = async () => {
      try {
        const res = await axios.get('/api/supermarkets');
        setSupermarkets(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching supermarkets:', err);
        setLoading(false);
      }
    };
    
    getSupermarkets();
    
    // Set default name based on date
    setShoppingList({
      ...shoppingList,
      name: `Shopping List - ${new Date().toLocaleDateString()}`
    });
  }, []);
  
  // Handle input change
  const handleChange = (e) => {
    setShoppingList({
      ...shoppingList,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setShoppingList({
      ...shoppingList,
      plannedPurchaseDate: date
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shoppingList.name.trim()) {
      setAlert('Please provide a name for the shopping list', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await axios.post('/api/shopping-lists', shoppingList);
      setAlert('Shopping list created successfully', 'success');
      navigate(`/shopping/lists/${res.data._id}`);
    } catch (err) {
      console.error('Error creating shopping list:', err);
      setAlert('Failed to create shopping list', 'error');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            component={Link}
            to="/shopping/lists"
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">
            Create New Shopping List
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Create a new shopping list to organize your shopping trips. You'll be able to add items to the list after it's created.
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="List Name"
                name="name"
                value={shoppingList.name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={shoppingList.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="e.g., Weekly shopping for catering event on Saturday"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Primary Supermarket (Optional)</InputLabel>
                <Select
                  name="primarySupermarket"
                  value={shoppingList.primarySupermarket}
                  onChange={handleChange}
                  label="Primary Supermarket (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {supermarkets.map(supermarket => (
                    <MenuItem key={supermarket._id} value={supermarket._id}>
                      {supermarket.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {/* Note: This is using MUI DatePicker which requires additional setup */}
              {/* If DatePicker is not available, you can use a simple TextField with type="date" */}
              <TextField
                fullWidth
                label="Planned Purchase Date (Optional)"
                name="plannedPurchaseDate"
                type="date"
                value={shoppingList.plannedPurchaseDate || ''}
                onChange={(e) => handleDateChange(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/shopping/lists')}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={24} /> : <SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Shopping List'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NewShoppingList;
