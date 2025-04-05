import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChipInput from '../common/ChipInput'; // This would be a custom component for handling tags
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';

import AlertContext from '../../context/alert/alertContext';

const IngredientForm = () => {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [loading, setLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [supermarketsLoading, setSupermarketsLoading] = useState(true);
  const [ingredient, setIngredient] = useState({
    name: '',
    description: '',
    category: 'other',
    purchasePrice: '',
    currency: 'AUD', // Default to AUD for Australian market
    purchaseUnit: '',
    recipeUnit: '',
    conversionRatio: '',
    supplier: '',
    barcode: '',
    imageUrl: '',
    inStock: true,
    stockQuantity: 0,
    wastagePercentage: 0,
    tags: [],
    notes: '',
    prices: [],
    preferredSupermarket: ''
  });

  // For handling price comparisons
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [newPrice, setNewPrice] = useState({
    supermarket: '',
    price: '',
    isManualEntry: true
  });
  
  // Load categories, supermarkets, and ingredient data (if editing)
  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await axios.get('/api/ingredients/util/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const getSupermarkets = async () => {
      try {
        const res = await axios.get('/api/supermarkets');
        setSupermarkets(res.data);
        setSupermarketsLoading(false);
      } catch (err) {
        console.error('Error fetching supermarkets:', err);
        setSupermarketsLoading(false);
      }
    };
    
    const getIngredient = async () => {
      if (isEditMode) {
        try {
          const res = await axios.get(`/api/ingredients/${id}`);
          setIngredient(res.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching ingredient:', err);
          setAlert('Failed to load ingredient', 'error');
          setLoading(false);
          navigate('/ingredients');
        }
      } else {
        // Check if there's prefilled data from camera or barcode scanning
        if (location.state?.prefillData) {
          setIngredient(prev => ({
            ...prev,
            ...location.state.prefillData
          }));
        }
        setLoading(false);
      }
    };
    
    getCategories();
    getSupermarkets();
    getIngredient();
  }, [id, isEditMode, navigate, setAlert, location.state]);
  
  const onChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (['purchasePrice', 'conversionRatio', 'stockQuantity', 'wastagePercentage'].includes(name)) {
      if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
        setIngredient({ ...ingredient, [name]: value });
      }
    } else {
      setIngredient({ ...ingredient, [name]: value });
    }
  };
  
  const handleSwitchChange = (e) => {
    setIngredient({ ...ingredient, [e.target.name]: e.target.checked });
  };
  
  const handleTagsChange = (tags) => {
    setIngredient({ ...ingredient, tags });
  };

  const handleNewPriceChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
        setNewPrice({ ...newPrice, [name]: value });
      }
    } else {
      setNewPrice({ ...newPrice, [name]: value });
    }
  };

  const addPrice = () => {
    if (!newPrice.supermarket || !newPrice.price) {
      setAlert('Please select a supermarket and enter a price', 'error');
      return;
    }

    // Check if price for this supermarket already exists
    const existingPriceIndex = ingredient.prices.findIndex(
      p => p.supermarket === newPrice.supermarket
    );

    let updatedPrices = [...ingredient.prices];
    
    if (existingPriceIndex !== -1) {
      // Update existing price
      updatedPrices[existingPriceIndex] = {
        ...updatedPrices[existingPriceIndex],
        price: parseFloat(newPrice.price),
        priceDate: new Date(),
        isManualEntry: true
      };
    } else {
      // Add new price
      updatedPrices.push({
        supermarket: newPrice.supermarket,
        price: parseFloat(newPrice.price),
        priceDate: new Date(),
        isManualEntry: true
      });
    }

    setIngredient({
      ...ingredient,
      prices: updatedPrices
    });

    // Reset form
    setNewPrice({
      supermarket: '',
      price: '',
      isManualEntry: true
    });
  };

  const removePrice = (supermarketId) => {
    const updatedPrices = ingredient.prices.filter(
      p => p.supermarket !== supermarketId
    );
    
    setIngredient({
      ...ingredient,
      prices: updatedPrices
    });
  };

  const getSupermarketName = (supermarketId) => {
    if (!supermarkets || supermarkets.length === 0) return 'Unknown';
    
    const supermarket = supermarkets.find(s => s._id === supermarketId);
    return supermarket ? supermarket.name : 'Unknown';
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!ingredient.name || !ingredient.purchasePrice || !ingredient.purchaseUnit || 
        !ingredient.recipeUnit || !ingredient.conversionRatio) {
      setAlert('Please fill all required fields', 'error');
      return;
    }
    
    // Prepare data for submission
    const formData = {
      ...ingredient,
      purchasePrice: parseFloat(ingredient.purchasePrice),
      conversionRatio: parseFloat(ingredient.conversionRatio),
      stockQuantity: parseFloat(ingredient.stockQuantity || 0),
      wastagePercentage: parseFloat(ingredient.wastagePercentage || 0)
    };
    
    try {
      if (isEditMode) {
        await axios.put(`/api/ingredients/${id}`, formData);
        setAlert('Ingredient updated successfully', 'success');
      } else {
        await axios.post('/api/ingredients', formData);
        setAlert('Ingredient added successfully', 'success');
      }
      navigate('/ingredients');
    } catch (err) {
      console.error('Error saving ingredient:', err);
      setAlert(err.response?.data?.message || 'Failed to save ingredient', 'error');
    }
  };
  
  if (loading || supermarketsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/ingredients')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5">
            {isEditMode ? 'Edit Ingredient' : 'Add New Ingredient'}
          </Typography>
        </Box>
        
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6">Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Ingredient Name"
                name="name"
                value={ingredient.name}
                onChange={onChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={ingredient.category}
                  onChange={onChange}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={ingredient.description}
                onChange={onChange}
                multiline
                rows={2}
              />
            </Grid>
            
            {/* Pricing and Units */}
            <Grid item xs={12}>
              <Typography variant="h6">Pricing and Units</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Default Purchase Price"
                name="purchasePrice"
                value={ingredient.purchasePrice}
                onChange={onChange}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">AUD</InputAdornment>,
                }}
                helperText="Main price used for calculations if no supermarket is selected"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Purchase Unit"
                name="purchaseUnit"
                value={ingredient.purchaseUnit}
                onChange={onChange}
                placeholder="kg, liter, dozen, etc."
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Recipe Unit"
                name="recipeUnit"
                value={ingredient.recipeUnit}
                onChange={onChange}
                placeholder="g, ml, piece, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Conversion Ratio (Recipe units per purchase unit)"
                name="conversionRatio"
                value={ingredient.conversionRatio}
                onChange={onChange}
                type="number"
                helperText="E.g., 1000 if 1 kg = 1000 g, or 4 if 1 dozen = 4 servings"
              />
            </Grid>

            {/* Supermarket Price Comparison */}
            <Grid item xs={12}>
              <Accordion 
                expanded={showPriceComparison} 
                onChange={() => setShowPriceComparison(!showPriceComparison)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Supermarket Price Comparison</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Compare prices across different supermarkets to find the best deals. The app will help you track price changes over time.
                  </Alert>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth>
                        <InputLabel>Supermarket</InputLabel>
                        <Select
                          name="supermarket"
                          value={newPrice.supermarket}
                          onChange={handleNewPriceChange}
                        >
                          {supermarkets.map(supermarket => (
                            <MenuItem key={supermarket._id} value={supermarket._id}>
                              {supermarket.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        value={newPrice.price}
                        onChange={handleNewPriceChange}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={addPrice}
                        startIcon={<AddIcon />}
                        sx={{ height: '56px' }}
                      >
                        Add Price
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Supermarket Price Comparison Table */}
                  {ingredient.prices && ingredient.prices.length > 0 ? (
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Supermarket</TableCell>
                            <TableCell>Price (AUD)</TableCell>
                            <TableCell>Last Updated</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ingredient.prices.map((price, index) => (
                            <TableRow key={index}>
                              <TableCell>{getSupermarketName(price.supermarket)}</TableCell>
                              <TableCell>${Number(price.price).toFixed(2)}</TableCell>
                              <TableCell>
                                {price.priceDate ? new Date(price.priceDate).toLocaleDateString() : 'Today'}
                              </TableCell>
                              <TableCell>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => removePrice(price.supermarket)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Card sx={{ mb: 2 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No supermarket prices added yet. Add prices to compare across stores.
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Preferred Supermarket</InputLabel>
                    <Select
                      name="preferredSupermarket"
                      value={ingredient.preferredSupermarket}
                      onChange={onChange}
                    >
                      <MenuItem value="">
                        <em>None (Use default price)</em>
                      </MenuItem>
                      {supermarkets.map(supermarket => (
                        <MenuItem key={supermarket._id} value={supermarket._id}>
                          {supermarket.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      The preferred supermarket's price will be used for recipe calculations
                    </FormHelperText>
                  </FormControl>
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            {/* Inventory */}
            <Grid item xs={12}>
              <Typography variant="h6">Inventory</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ingredient.inStock}
                    onChange={handleSwitchChange}
                    name="inStock"
                    color="primary"
                  />
                }
                label="In Stock"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                name="stockQuantity"
                value={ingredient.stockQuantity}
                onChange={onChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">{ingredient.purchaseUnit}</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wastage Percentage"
                name="wastagePercentage"
                value={ingredient.wastagePercentage}
                onChange={onChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="Estimated percentage lost in preparation (0-100)"
              />
            </Grid>
            
            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="h6">Additional Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier"
                name="supplier"
                value={ingredient.supplier}
                onChange={onChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Barcode"
                name="barcode"
                value={ingredient.barcode}
                onChange={onChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="imageUrl"
                value={ingredient.imageUrl}
                onChange={onChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              {/* This would be a custom component for managing tags */}
              <FormControl fullWidth>
                <InputLabel shrink>Tags</InputLabel>
                <Box sx={{ mt: 2 }}>
                  {/* Placeholder for the ChipInput component */}
                  <TextField
                    fullWidth
                    placeholder="Enter tags separated by comma"
                    value={ingredient.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value.split(', ').filter(tag => tag.trim() !== ''))}
                  />
                </Box>
                <FormHelperText>Enter tags to categorize this ingredient</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={ingredient.notes}
                onChange={onChange}
                multiline
                rows={3}
              />
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
              >
                {isEditMode ? 'Update Ingredient' : 'Save Ingredient'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default IngredientForm;
